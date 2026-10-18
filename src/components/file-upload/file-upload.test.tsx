import { useState } from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { FileUpload } from "./file-upload";

const png = (name = "cat.png", size = 1200) => new File([new Uint8Array(size)], name, { type: "image/png", lastModified: 1 });
const pdf = (name = "spec.pdf", size = 3000) => new File([new Uint8Array(size)], name, { type: "application/pdf", lastModified: 1 });

const fileInput = () => document.querySelector('input[type="file"]') as HTMLInputElement;
const pick = (...files: File[]) => fireEvent.change(fileInput(), { target: { files } });
const listed = () =>
  screen.queryByRole("list", { name: "Selected files" })
    ? within(screen.getByRole("list", { name: "Selected files" }))
        .getAllByRole("listitem")
        .map((li) => li.querySelector("[title]")?.textContent)
    : [];

describe("FileUpload", () => {
  it("the dropzone is a button named by the label and described by the prompt", () => {
    render(<FileUpload label="Attachments" description="PNG or PDF, up to 5 MB" />);
    const zone = screen.getByRole("button", { name: "Attachments" });
    expect(zone).toHaveAccessibleDescription("Drag files here or browse PNG or PDF, up to 5 MB");
  });

  it("clicking the dropzone opens the native picker", () => {
    render(<FileUpload label="Attachments" />);
    const click = vi.spyOn(fileInput(), "click");
    fireEvent.click(screen.getByRole("button", { name: "Attachments" }));
    expect(click).toHaveBeenCalled();
  });

  it("lists picked files with sizes and ignores the same file picked twice", () => {
    const onValueChange = vi.fn();
    render(<FileUpload label="Attachments" onValueChange={onValueChange} />);
    pick(png(), pdf());
    pick(png());
    expect(listed()).toEqual(["cat.png", "spec.pdf"]);
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(screen.getByText("1.2 kB")).toBeInTheDocument();
  });

  it("refuses files by type, size and count, with reasons", () => {
    const onReject = vi.fn();
    render(<FileUpload label="Images" accept="image/*" maxSize={2000} maxFiles={2} onReject={onReject} />);
    pick(png("a.png"), pdf(), png("huge.png", 5000), png("b.png"), png("c.png"));
    expect(listed()).toEqual(["a.png", "b.png"]);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("spec.pdf: this file type is not accepted");
    expect(alert).toHaveTextContent("huge.png is larger than 2 kB");
    expect(alert).toHaveTextContent("c.png was not added: up to 2 files");
    expect(onReject.mock.calls[0]![0].map((r: { file: File }) => r.file.name)).toEqual(["spec.pdf", "huge.png", "c.png"]);
  });

  it("single mode replaces the file", () => {
    render(<FileUpload label="Avatar" multiple={false} />);
    pick(png("one.png"));
    pick(png("two.png"));
    expect(listed()).toEqual(["two.png"]);
  });

  it("accepts dropped files and shows the drop state while dragging", () => {
    const { container } = render(<FileUpload label="Attachments" />);
    const root = container.firstElementChild as HTMLElement;
    const dataTransfer = { types: ["Files"], files: [png()], dropEffect: "none" };
    fireEvent.dragEnter(root, { dataTransfer });
    expect(root).toHaveAttribute("data-dragging", "true");
    expect(screen.getByText("Drop to add")).toBeInTheDocument();
    fireEvent.drop(root, { dataTransfer });
    expect(root).not.toHaveAttribute("data-dragging");
    expect(listed()).toEqual(["cat.png"]);
  });

  it("ignores drags that carry no files", () => {
    const { container } = render(<FileUpload label="Attachments" />);
    const root = container.firstElementChild as HTMLElement;
    fireEvent.dragEnter(root, { dataTransfer: { types: ["text/plain"], files: [] } });
    expect(root).not.toHaveAttribute("data-dragging");
  });

  it("removes a file and moves focus to the next row", () => {
    render(<FileUpload label="Attachments" defaultValue={[png("a.png"), png("b.png"), png("c.png")]} />);
    fireEvent.click(screen.getByRole("button", { name: "Remove a.png" }));
    expect(listed()).toEqual(["b.png", "c.png"]);
    expect(screen.getByRole("button", { name: "Remove b.png" })).toHaveFocus();
  });

  it("removing the last file returns focus to the dropzone", () => {
    render(<FileUpload label="Attachments" defaultValue={[png("a.png")]} />);
    fireEvent.click(screen.getByRole("button", { name: "Remove a.png" }));
    expect(screen.getByRole("button", { name: "Attachments" })).toHaveFocus();
  });

  it("messages can be translated", () => {
    render(
      <FileUpload
        accept=".pdf"
        messages={{
          prompt: "Перетащите файлы или",
          browse: "выберите",
          fileList: "Файлы",
          error: (code, file) => (code === "file-invalid-type" ? `${file.name}: неподходящий тип` : code),
        }}
      />,
    );
    expect(screen.getByRole("button", { name: "Перетащите файлы или выберите" })).toBeInTheDocument();
    pick(png());
    expect(screen.getByRole("alert")).toHaveTextContent("cat.png: неподходящий тип");
  });

  it("works controlled", () => {
    function Controlled() {
      const [files, setFiles] = useState<File[]>([]);
      return (
        <>
          <FileUpload label="Attachments" value={files} onValueChange={setFiles} />
          <button type="button" onClick={() => setFiles([])}>
            reset
          </button>
        </>
      );
    }
    render(<Controlled />);
    pick(png());
    expect(listed()).toEqual(["cat.png"]);
    fireEvent.click(screen.getByRole("button", { name: "reset" }));
    expect(listed()).toEqual([]);
  });

  it("the compact button variant keeps the same behaviour", () => {
    render(<FileUpload label="Attachments" variant="button" description="Up to 10 files" />);
    expect(screen.getByRole("button", { name: "Attachments" })).toHaveTextContent("Choose files");
    expect(screen.getByText("Up to 10 files")).toBeInTheDocument();
  });
});

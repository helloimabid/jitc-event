"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  className,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [selection, setSelection] = useState<Range | null>(null);

  // Initialize editor content
  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  // Handle editor changes
  const handleEditorChange = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  // Save selection before opening link dialog
  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      setSelection(sel.getRangeAt(0));
      setLinkText(sel.toString());
    }
  };

  // Restore selection after closing link dialog
  const restoreSelection = () => {
    if (selection && editorRef.current) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(selection);
      }
    }
  };

  // Execute command on the editor with improved error handling
  const execCommand = (command: string, value?: string) => {
    try {
      // Focus the editor before executing commands to ensure we're in the right context
      if (editorRef.current) {
        editorRef.current.focus();
      }

      document.execCommand(command, false, value);

      // Special handling for lists
      if (
        command === "insertUnorderedList" ||
        command === "insertOrderedList"
      ) {
        // Sometimes we need to ensure proper list formatting
        if (editorRef.current) {
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
            // Force the selection to be within the editor
            const range = selection.getRangeAt(0);
            const commonAncestor = range.commonAncestorContainer;

            // If the selection is not within the editor, fix it
            if (!editorRef.current.contains(commonAncestor)) {
              const newRange = document.createRange();
              newRange.selectNodeContents(editorRef.current);
              selection.removeAllRanges();
              selection.addRange(newRange);
            }
          }
        }
      }

      handleEditorChange();
    } catch (error) {
      console.error(`Error executing command ${command}:`, error);
    }
  };

  // Format handlers
  const handleBold = () => execCommand("bold");
  const handleItalic = () => execCommand("italic");
  const handleUnderline = () => execCommand("underline");
  const handleH1 = () => execCommand("formatBlock", "<h1>");
  const handleH2 = () => execCommand("formatBlock", "<h2>");

  // Improved list handlers with direct implementation
  const handleBulletList = () => {
    execCommand("insertUnorderedList");

    // Additional verification and fallback
    setTimeout(() => {
      const hasUL = editorRef.current?.querySelector("ul");
      if (!hasUL && editorRef.current) {
        // If execCommand didn't work, try manual insertion
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const selectedText = range.toString();

          // Create a list with the selected text or a placeholder item
          const listHTML = `<ul><li>${selectedText || "List item"}</li></ul>`;

          range.deleteContents();
          const fragment = range.createContextualFragment(listHTML);
          range.insertNode(fragment);

          // Place cursor at the end of the inserted text
          range.setStartAfter(fragment);
          range.setEndAfter(fragment);
          selection.removeAllRanges();
          selection.addRange(range);

          handleEditorChange();
        }
      }
    }, 50);
  };

  const handleOrderedList = () => {
    execCommand("insertOrderedList");

    // Additional verification and fallback
    setTimeout(() => {
      const hasOL = editorRef.current?.querySelector("ol");
      if (!hasOL && editorRef.current) {
        // If execCommand didn't work, try manual insertion
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const selectedText = range.toString();

          // Create a list with the selected text or a placeholder item
          const listHTML = `<ol><li>${selectedText || "List item"}</li></ol>`;

          range.deleteContents();
          const fragment = range.createContextualFragment(listHTML);
          range.insertNode(fragment);

          // Place cursor at the end of the inserted text
          range.setStartAfter(fragment);
          range.setEndAfter(fragment);
          selection.removeAllRanges();
          selection.addRange(range);

          handleEditorChange();
        }
      }
    }, 50);
  };

  const handleAlignLeft = () => execCommand("justifyLeft");
  const handleAlignCenter = () => execCommand("justifyCenter");
  const handleAlignRight = () => execCommand("justifyRight");

  // Link handlers
  const handleLinkClick = () => {
    saveSelection();
    setLinkDialogOpen(true);
  };

  // Handle key presses for better editing experience
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case "b":
          e.preventDefault();
          handleBold();
          break;
        case "i":
          e.preventDefault();
          handleItalic();
          break;
        case "u":
          e.preventDefault();
          handleUnderline();
          break;
      }
    }

    // Handle Tab key within lists
    if (e.key === "Tab" && !e.shiftKey) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        let currentNode = range.startContainer;

        // Find the closest li element
        while (currentNode && currentNode.nodeName !== "LI") {
          currentNode = currentNode.parentNode;
        }

        if (currentNode && currentNode.nodeName === "LI") {
          e.preventDefault();
          execCommand("indent");
        }
      }
    }

    // Ensure changes are captured after Enter key press
    if (e.key === "Enter") {
      setTimeout(handleEditorChange, 10);
    }
  };

  const addLink = () => {
    if (linkUrl) {
      restoreSelection();
      if (linkText && selection?.toString() === "") {
        // If no text is selected, insert the link text
        execCommand(
          "insertHTML",
          `<a href="${linkUrl}" target="_blank">${linkText}</a>`
        );
      } else {
        // If text is selected, convert it to a link
        execCommand("createLink", linkUrl);
        // Fix for links - ensure they open in a new tab
        const links = editorRef.current?.querySelectorAll("a");
        links?.forEach((link) => {
          if (link.getAttribute("href") === linkUrl) {
            link.setAttribute("target", "_blank");
          }
        });
      }
      setLinkUrl("");
      setLinkText("");
      setLinkDialogOpen(false);
    }
  };

  return (
    <div className={cn("border rounded-md", className)}>
      <div className="flex flex-wrap gap-1 p-1 border-b bg-muted/50">
        <button
          type="button"
          className="p-2 rounded hover:bg-muted"
          onClick={handleBold}
          aria-label="Bold"
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="p-2 rounded hover:bg-muted"
          onClick={handleItalic}
          aria-label="Italic"
        >
          <Italic className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="p-2 rounded hover:bg-muted"
          onClick={handleUnderline}
          aria-label="Underline"
        >
          <Underline className="h-4 w-4" />
        </button>
        <div className="w-px h-6 bg-border mx-1 my-auto" />
        <button
          type="button"
          className="p-2 rounded hover:bg-muted"
          onClick={handleH1}
          aria-label="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="p-2 rounded hover:bg-muted"
          onClick={handleH2}
          aria-label="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </button>
        <div className="w-px h-6 bg-border mx-1 my-auto" />
        <button
          type="button"
          className="p-2 rounded hover:bg-muted"
          onClick={handleBulletList}
          aria-label="Bullet List"
        >
          <List className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="p-2 rounded hover:bg-muted"
          onClick={handleOrderedList}
          aria-label="Ordered List"
        >
          <ListOrdered className="h-4 w-4" />
        </button>
        <div className="w-px h-6 bg-border mx-1 my-auto" />
        <button
          type="button"
          className="p-2 rounded hover:bg-muted"
          onClick={handleLinkClick}
          aria-label="Link"
        >
          <LinkIcon className="h-4 w-4" />
        </button>
        <div className="w-px h-6 bg-border mx-1 my-auto" />
        <button
          type="button"
          className="p-2 rounded hover:bg-muted"
          onClick={handleAlignLeft}
          aria-label="Align Left"
        >
          <AlignLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="p-2 rounded hover:bg-muted"
          onClick={handleAlignCenter}
          aria-label="Align Center"
        >
          <AlignCenter className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="p-2 rounded hover:bg-muted"
          onClick={handleAlignRight}
          aria-label="Align Right"
        >
          <AlignRight className="h-4 w-4" />
        </button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        className="p-3 min-h-[150px] focus:outline-none prose dark:prose-invert prose-sm sm:prose-base max-w-none empty:before:content-[attr(data-placeholder)] empty:before:text-muted empty:before:block"
        onInput={handleEditorChange}
        onBlur={handleEditorChange}
        onKeyDown={handleKeyDown}
        data-placeholder={placeholder || "Write something..."}
      />

      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Link</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col space-y-4 py-4">
            <div className="flex flex-col space-y-2">
              <label htmlFor="link-text" className="text-sm font-medium">
                Link Text
              </label>
              <Input
                id="link-text"
                placeholder="Enter link text"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
              />
            </div>
            <div className="flex flex-col space-y-2">
              <label htmlFor="link-url" className="text-sm font-medium">
                URL
              </label>
              <Input
                id="link-url"
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setLinkDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={addLink}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
export default RichTextEditor;
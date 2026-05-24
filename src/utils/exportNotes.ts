import { Note } from '../types';

// ── Strip HTML tags ─────────────────────────────────────────────────────────────
const strip = (html: string) => {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
};

// ── Export as JSON ──────────────────────────────────────────────────────────────
export const exportJSON = (notes: Note[]) => {
  const data = notes.map(n => ({
    id: n.id,
    content: strip(n.content),
    category: n.category,
    color: n.color,
    status: n.status ?? 'todo',
    isPinned: n.isPinned,
    isCompleted: n.isCompleted,
    isArchived: n.isArchived,
    reminderDate: n.reminderDate,
    timestamp: n.timestamp,
    subtasks: (n.subtasks ?? []).map(s => ({ text: s.text, isCompleted: s.isCompleted })),
  }));
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  downloadBlob(blob, `stickyflow-notes-${dateStr()}.json`);
};

// ── Export as CSV ───────────────────────────────────────────────────────────────
export const exportCSV = (notes: Note[]) => {
  const headers = ['ID', 'Content', 'Category', 'Color', 'Status', 'Pinned', 'Completed', 'Archived', 'Reminder', 'Created'];
  const rows = notes.map(n => [
    n.id,
    `"${strip(n.content).replace(/"/g, '""')}"`,
    n.category,
    n.color,
    n.status ?? 'todo',
    n.isPinned ? 'Yes' : 'No',
    n.isCompleted ? 'Yes' : 'No',
    n.isArchived ? 'Yes' : 'No',
    n.reminderDate ?? '',
    n.timestamp,
  ]);
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  downloadBlob(blob, `stickyflow-notes-${dateStr()}.csv`);
};

// ── Export as PDF ───────────────────────────────────────────────────────────────
export const exportPDF = async (notes: Note[]) => {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const pageW = doc.internal.pageSize.getWidth();
  const margin = 15;
  const colW = pageW - margin * 2;
  let y = margin;

  // Title
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 30, 30);
  doc.text('StickyFlow — Notes Export', margin, y);
  y += 7;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(130, 130, 130);
  doc.text(`Exported on ${new Date().toLocaleString()} · ${notes.length} notes`, margin, y);
  y += 6;

  // Divider
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, pageW - margin, y);
  y += 8;

  const activePalette: Record<string, [number, number, number]> = {
    yellow: [250, 204, 21],
    pink: [236, 72, 153],
    blue: [59, 130, 246],
    cyan: [6, 182, 212],
    green: [34, 197, 94],
    purple: [139, 92, 246],
  };

  notes.forEach((note, idx) => {
    const text = strip(note.content);
    const lines = doc.splitTextToSize(text, colW - 8);
    const blockH = 10 + lines.length * 5 + 8;

    // New page if needed
    if (y + blockH > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      y = margin;
    }

    // Card background
    const [r, g, b] = activePalette[note.color] ?? [250, 204, 21];
    doc.setFillColor(r, g, b);
    doc.roundedRect(margin, y, colW, blockH, 4, 4, 'F');

    // Category
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(60, 60, 60);
    doc.text(note.category.toUpperCase(), margin + 4, y + 5);

    // Content
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(20, 20, 20);
    doc.text(lines, margin + 4, y + 10);

    // Footer: status + timestamp
    const footerY = y + blockH - 4;
    doc.setFontSize(7);
    doc.setTextColor(80, 80, 80);
    doc.text(`Status: ${note.status ?? 'todo'}`, margin + 4, footerY);
    doc.text(new Date(note.timestamp).toLocaleDateString(), pageW - margin - 4, footerY, { align: 'right' });

    y += blockH + 4;
  });

  doc.save(`stickyflow-notes-${dateStr()}.pdf`);
};

// ── Helpers ─────────────────────────────────────────────────────────────────────
const dateStr = () => new Date().toISOString().slice(0, 10);

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

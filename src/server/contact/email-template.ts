import 'server-only';
import type { ContactInput } from '@/lib/validation/contact-schema';

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export const escapeHtml = (value: string): string =>
  value.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);

const singleLine = (value: string): string => value.replace(/[\r\n]+/g, ' ').trim();

interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

export const renderContactEmail = (input: ContactInput): RenderedEmail => {
  const rows: Array<[string, string]> = [
    ['Nombre', input.name],
    ['Email', input.email],
    ['Empresa', input.company || '—'],
    ['Tipo de proyecto', input.projectType],
    ['Presupuesto', input.budget],
  ];

  const htmlRows = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:6px 12px;color:#5c5c5c">${label}</td><td style="padding:6px 12px">${escapeHtml(value)}</td></tr>`,
    )
    .join('');

  return {
    subject: `Nueva solicitud de proyecto — ${singleLine(input.name)}`,
    html: `<div style="font-family:Arial,sans-serif;color:#0a0a0a"><h2>Nueva solicitud desde zentinel_labs.</h2><table>${htmlRows}</table><h3>Mensaje</h3><p style="white-space:pre-wrap">${escapeHtml(input.message)}</p></div>`,
    text: [...rows.map(([label, value]) => `${label}: ${value}`), '', input.message].join('\n'),
  };
};

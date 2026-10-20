// Progressive enhancement only. The site works without this file.

// 1. Contact form: compose a WhatsApp or e-mail message from the fields. No data leaves the browser.
const form = document.getElementById('contact-form');
if (form) {
  const params = new URLSearchParams(location.search);
  const presetProduct = params.get('produto');
  if (presetProduct) {
    form.elements.equipamento.value = presetProduct;
    form.elements.assunto.value = 'Compra';
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const via = event.submitter?.value ?? 'whatsapp';
    const f = form.elements;
    const lines = [
      `Olá, Equimed! Vim pelo site.`,
      ``,
      `Nome: ${f.nome.value.trim()}`,
      f.empresa.value.trim() && `Empresa: ${f.empresa.value.trim()}`,
      `Telefone: ${f.telefone.value.trim()}`,
      `Preciso de: ${f.assunto.value}`,
      f.equipamento.value.trim() && `Equipamento: ${f.equipamento.value.trim()}`,
      ``,
      f.mensagem.value.trim(),
    ].filter((l) => l !== false && l !== '' || l === '');
    const text = lines.join('\n');

    if (via === 'email') {
      const subject = `[Site] ${f.assunto.value}${f.equipamento.value.trim() ? ` - ${f.equipamento.value.trim()}` : ''}`;
      location.href = `mailto:${form.dataset.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
    } else {
      window.open(`https://wa.me/${form.dataset.whatsapp}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
    }
  });
}

// 2. Close the mobile menu when a link inside it is activated (popover stays open on same-page anchors otherwise).
const menu = document.getElementById('site-menu');
menu?.addEventListener('click', (event) => {
  if (event.target.closest('a')) menu.hidePopover?.();
});

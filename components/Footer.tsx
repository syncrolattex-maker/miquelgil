export default function Footer() {
  return (
    <footer className="footer">
      <span>© {new Date().getFullYear()} Miquel Gil — Tots els drets reservats</span>
      <div className="footer__links">
        <a href="/contacte">Contacte</a>
        <a href="/media">Media</a>
        <a href="/descarregues">Descàrregues</a>
        <a
          href="https://www.instagram.com/miquelgil.oficial/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Instagram
        </a>
      </div>
    </footer>
  );
}

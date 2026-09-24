export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div>
          <p className="footer-brand">Megamuii Works</p>
          <p className="footer-copy">พื้นที่เล็ก ๆ สำหรับผลงาน ม็อด และไฟล์ดาวน์โหลด</p>
        </div>
        <p className="footer-copyright">© {new Date().getFullYear()} Megamuii Works</p>
      </div>
    </footer>
  )
}

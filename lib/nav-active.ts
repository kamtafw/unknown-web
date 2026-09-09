/**
 * determines whether a sidebar/mobile-nav item should render as active;
 * post detail pages are conceptually part of the Home feed surface (that's
 * where every post is discovered from), so Home stays highlighted there
 * even though the URL no longer matches /home exactly
 */
export function isNavItemActive(pathname: string, href: string): boolean {
	if (href === "/home") {
		return pathname === "/home" || pathname.startsWith("/posts/")
	}
	return pathname === href
}

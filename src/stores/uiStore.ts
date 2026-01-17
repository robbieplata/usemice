export class UIStore {
  isSidebarOpen = false
  theme: 'light' | 'dark' = 'light'

  constructor() {}

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen
  }

  setTheme(theme: 'light' | 'dark') {
    this.theme = theme
  }
}

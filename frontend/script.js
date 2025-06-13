class BookLibraryAPI {
  constructor(baseURL = "http://localhost:5000") {
    this.baseURL = baseURL
    this.token = localStorage.getItem("token")
  }

  getAuthHeaders() {
    return {
      "Content-Type": "application/json",
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
    }
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const config = {
      headers: this.getAuthHeaders(),
      ...options,
    }

    if (config.body && typeof config.body === "object") {
      config.body = JSON.stringify(config.body)
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        // Handle token expiration
        if (response.status === 401) {
          this.logout()
          throw new Error("Your magical session has expired. Please enter the realm again.")
        }
        throw new Error(data.message || `Mystical error! status: ${response.status}`)
      }

      return data
    } catch (error) {
      console.error("API request failed:", error)
      throw error
    }
  }

  // Auth methods
  async register(userData) {
    const response = await this.request("/api/users/register", {
      method: "POST",
      body: userData,
    })
    return response
  }

  async login(credentials) {
    const response = await this.request("/api/users/login", {
      method: "POST",
      body: credentials,
    })

    if (response.accessToken) {
      this.token = response.accessToken
      localStorage.setItem("token", this.token)
    }

    return response
  }

  async getCurrentUser() {
    return this.request("/api/users/current")
  }

  logout() {
    this.token = null
    localStorage.removeItem("token")
  }

  // Books methods
  async getBooks() {
    return this.request("/api/books")
  }

  async getBook(id) {
    return this.request(`/api/books/${id}`)
  }

  async createBook(bookData) {
    return this.request("/api/books", {
      method: "POST",
      body: bookData,
    })
  }

  async updateBook(id, bookData) {
    return this.request(`/api/books/${id}`, {
      method: "PUT",
      body: bookData,
    })
  }

  async deleteBook(id) {
    return this.request(`/api/books/${id}`, {
      method: "DELETE",
    })
  }
}

class BookLibraryApp {
  constructor() {
    this.api = new BookLibraryAPI()
    this.books = []
    this.currentUser = null
    this.filteredBooks = []
    this.init()
  }

  init() {
    this.setupEventListeners()
    this.checkAuthStatus()
    this.createMagicalEffects()

    // Add direct click handler for register button
    const registerBtn = document.getElementById("register-submit-btn")
    if (registerBtn) {
      registerBtn.addEventListener("click", (e) => {
        if (e.target.closest("form")) {
          const form = e.target.closest("form")
          if (form.id === "register") {
            e.preventDefault()
            this.handleRegister(e)
          }
        }
      })
    }
  }

  createMagicalEffects() {
    // Add more floating elements dynamically
    const container = document.querySelector(".floating-books")
    if (container) {
      const magicalElements = ["🌟", "✨", "🔮", "📚", "📖", "📜", "⭐", "🌙"]

      setInterval(() => {
        if (Math.random() > 0.7) {
          const element = document.createElement("div")
          element.className = "floating-book"
          element.textContent = magicalElements[Math.floor(Math.random() * magicalElements.length)]
          element.style.left = Math.random() * 100 + "%"
          element.style.top = Math.random() * 100 + "%"
          element.style.animationDuration = Math.random() * 3 + 3 + "s"
          element.style.fontSize = Math.random() * 1 + 1.5 + "rem"

          container.appendChild(element)

          setTimeout(() => {
            if (element.parentNode) {
              element.parentNode.removeChild(element)
            }
          }, 6000)
        }
      }, 3000)
    }
  }

  setupEventListeners() {
    // Auth form switches
    const showRegisterLink = document.getElementById("show-register")
    if (showRegisterLink) {
      showRegisterLink.addEventListener("click", (e) => {
        e.preventDefault()
        console.log("Show register clicked")
        this.showRegisterForm()
      })
    } else {
      console.error("Show register link not found")
    }

    const showLoginLink = document.getElementById("show-login")
    if (showLoginLink) {
      showLoginLink.addEventListener("click", (e) => {
        e.preventDefault()
        console.log("Show login clicked")
        this.showLoginForm()
      })
    } else {
      console.error("Show login link not found")
    }

    // Rest of the event listeners remain the same...
    document.getElementById("login").addEventListener("submit", (e) => {
      this.handleLogin(e)
    })

    document.getElementById("register").addEventListener("submit", (e) => {
      this.handleRegister(e)
    })

    document.getElementById("logout-btn").addEventListener("click", () => {
      this.handleLogout()
    })

    document.getElementById("add-book-btn").addEventListener("click", () => {
      this.showBookForm()
    })

    document.getElementById("status-filter").addEventListener("change", (e) => {
      this.filterBooks(e.target.value)
    })

    document.getElementById("close-modal").addEventListener("click", () => {
      this.hideBookForm()
    })

    document.getElementById("cancel-book").addEventListener("click", () => {
      this.hideBookForm()
    })

    document.getElementById("book-form").addEventListener("submit", (e) => {
      this.handleBookSubmit(e)
    })

    document.getElementById("book-modal").addEventListener("click", (e) => {
      if (e.target.id === "book-modal" || e.target.className === "modal-backdrop") {
        this.hideBookForm()
      }
    })
  }

  async checkAuthStatus() {
    if (this.api.token) {
      try {
        this.currentUser = await this.api.getCurrentUser()
        this.showMainApp()
      } catch (error) {
        console.error("Auth check failed:", error)
        this.showAuthSection()
      }
    } else {
      this.showAuthSection()
    }
  }

  showAuthSection() {
    document.getElementById("auth-section").style.display = "flex"
    document.getElementById("main-app").style.display = "none"
  }

  showMainApp() {
    document.getElementById("auth-section").style.display = "none"
    document.getElementById("main-app").style.display = "block"
    this.updateUserWelcome()
    this.loadBooks()
  }

  showLoginForm() {
    console.log("Showing login form")
    const loginForm = document.getElementById("login-form")
    const registerForm = document.getElementById("register-form")

    if (loginForm) loginForm.classList.add("active")
    if (registerForm) registerForm.classList.remove("active")

    this.clearAuthError()
  }

  showRegisterForm() {
    console.log("Showing register form")
    const loginForm = document.getElementById("login-form")
    const registerForm = document.getElementById("register-form")

    if (registerForm) registerForm.classList.add("active")
    if (loginForm) loginForm.classList.remove("active")

    this.clearAuthError()
  }

  showAuthError(message) {
    const errorEl = document.getElementById("auth-error")
    errorEl.textContent = "🚫 " + message
    errorEl.style.display = "block"
  }

  clearAuthError() {
    document.getElementById("auth-error").style.display = "none"
  }

  async handleLogin(e) {
    e.preventDefault()

    const email = document.getElementById("login-email").value
    const password = document.getElementById("login-password").value

    try {
      await this.api.login({ email, password })
      this.currentUser = await this.api.getCurrentUser()
      this.showMainApp()
      this.clearAuthError()
    } catch (error) {
      this.showAuthError(error.message)
    }
  }

  async handleRegister(e) {
    e.preventDefault()

    const username = document.getElementById("register-username").value
    const email = document.getElementById("register-email").value
    const password = document.getElementById("register-password").value

    try {
      await this.api.register({ username, email, password })
      // Auto-login after registration
      await this.api.login({ email, password })
      this.currentUser = await this.api.getCurrentUser()
      this.showMainApp()
      this.clearAuthError()
    } catch (error) {
      this.showAuthError(error.message)
    }
  }

  handleLogout() {
    this.api.logout()
    this.currentUser = null
    this.books = []
    this.showAuthSection()

    // Reset forms
    document.getElementById("login").reset()
    document.getElementById("register").reset()
    this.showLoginForm()
  }

  updateUserWelcome() {
    if (this.currentUser) {
      document.getElementById("user-welcome").textContent = `Welcome, ${this.currentUser.username}! ✨`
    }
  }

  async loadBooks() {
    this.showLoading()
    try {
      this.books = await this.api.getBooks()
      this.filteredBooks = [...this.books]
      this.renderBooks()
      this.updateStats()
    } catch (error) {
      this.showError(`Failed to summon your magical tomes: ${error.message}`)
    } finally {
      this.hideLoading()
    }
  }

  updateStats() {
    const total = this.books.length
    const reading = this.books.filter((book) => book.status === "reading").length
    const completed = this.books.filter((book) => book.status === "completed").length
    const planned = this.books.filter((book) => book.status === "plan-to-read").length

    document.getElementById("total-books").textContent = total
    document.getElementById("reading-count").textContent = reading
    document.getElementById("completed-count").textContent = completed
    document.getElementById("planned-count").textContent = planned
  }

  filterBooks(status) {
    if (status === "") {
      this.filteredBooks = [...this.books]
    } else {
      this.filteredBooks = this.books.filter((book) => book.status === status)
    }
    this.renderBooks()
  }

  renderBooks() {
    const container = document.getElementById("books-grid")
    const emptyState = document.getElementById("empty-state")

    if (this.filteredBooks.length === 0) {
      container.innerHTML = ""
      emptyState.style.display = "block"
      return
    }

    emptyState.style.display = "none"

    container.innerHTML = this.filteredBooks
      .map(
        (book) => `
      <div class="book-card">
        <div class="book-header">
          <h3 class="book-title">${book.title}</h3>
          ${book.author ? `<p class="book-author">by ${book.author}</p>` : ""}
        </div>
        <div class="book-body">
          <div class="book-meta">
            ${book.genre ? `<p class="book-genre">📚 ${book.genre}</p>` : ""}
            <span class="book-status status-${book.status}">
              ${this.getStatusLabel(book.status)}
            </span>
          </div>
          <div class="book-actions">
            <button class="btn btn-edit" onclick="bookLibrary.editBook('${book._id}')">
              ✏️ Edit Tome
            </button>
            <button class="btn btn-danger" onclick="bookLibrary.deleteBook('${book._id}')">
              🗑️ Banish
            </button>
          </div>
        </div>
      </div>
    `,
      )
      .join("")
  }

  getStatusLabel(status) {
    const labels = {
      reading: "📖 Currently Reading",
      completed: "✅ Mastered",
      "plan-to-read": "🔮 Future Quest",
    }
    return labels[status] || status
  }

  showBookForm(book = null) {
    const modal = document.getElementById("book-modal")
    const title = document.getElementById("modal-title")
    const form = document.getElementById("book-form")

    if (book) {
      title.textContent = "✏️ Edit Magical Tome"
      document.getElementById("book-id").value = book._id
      document.getElementById("book-title").value = book.title
      document.getElementById("book-author").value = book.author || ""
      document.getElementById("book-genre").value = book.genre || ""
      document.getElementById("book-status").value = book.status
    } else {
      title.textContent = "📜 Add New Tome"
      form.reset()
      document.getElementById("book-status").value = "plan-to-read"
    }

    modal.style.display = "flex"
  }

  hideBookForm() {
    document.getElementById("book-modal").style.display = "none"
    document.getElementById("book-form").reset()
  }

  async handleBookSubmit(e) {
    e.preventDefault()

    const formData = {
      title: document.getElementById("book-title").value,
      author: document.getElementById("book-author").value || undefined,
      genre: document.getElementById("book-genre").value || undefined,
      status: document.getElementById("book-status").value,
    }

    const bookId = document.getElementById("book-id").value

    try {
      if (bookId) {
        await this.api.updateBook(bookId, formData)
      } else {
        await this.api.createBook(formData)
      }

      this.hideBookForm()
      this.loadBooks()
    } catch (error) {
      this.showError(`Failed to save magical tome: ${error.message}`)
    }
  }

  async editBook(id) {
    try {
      const book = await this.api.getBook(id)
      this.showBookForm(book)
    } catch (error) {
      this.showError(`Failed to summon tome for editing: ${error.message}`)
    }
  }

  async deleteBook(id) {
    if (!confirm("Are you sure you want to banish this magical tome from your library? 🔮")) {
      return
    }

    try {
      await this.api.deleteBook(id)
      this.loadBooks()
    } catch (error) {
      this.showError(`Failed to banish tome: ${error.message}`)
    }
  }

  showLoading() {
    document.getElementById("loading").style.display = "block"
    document.getElementById("error").style.display = "none"
  }

  hideLoading() {
    document.getElementById("loading").style.display = "none"
  }

  showError(message) {
    document.getElementById("loading").style.display = "none"
    const errorEl = document.getElementById("error")
    errorEl.textContent = "🚫 " + message
    errorEl.style.display = "block"
  }
}

// Initialize the magical app
const bookLibrary = new BookLibraryApp()

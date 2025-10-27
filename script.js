document.addEventListener("DOMContentLoaded", () => {
  const menuLinks = document.querySelectorAll(".menu-link")
  const submenuLinks = document.querySelectorAll(".submenu-link")
  const homeLink = document.getElementById("home-link")
  const helpBtn = document.getElementById("help-btn")
  const closeHelpBtn = document.getElementById("close-help-btn")
  const helpModal = document.getElementById("help-modal")
  const compararLink = document.getElementById("comparar-link") // Added for comparar link

  if (homeLink) {
    homeLink.addEventListener("click", (e) => {
      e.preventDefault()
      showHomePage()
    })
  }

  if (helpBtn) {
    helpBtn.addEventListener("click", () => {
      helpModal.classList.add("show")
    })
  }

  if (closeHelpBtn) {
    closeHelpBtn.addEventListener("click", () => {
      helpModal.classList.remove("show")
    })
  }

  // Cerrar modal al hacer clic fuera
  if (helpModal) {
    helpModal.addEventListener("click", (e) => {
      if (e.target === helpModal) {
        helpModal.classList.remove("show")
      }
    })
  }

  // Manejo de menú principal
  menuLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault()

      const toggleId = this.getAttribute("data-toggle")
      const submenu = document.getElementById(toggleId + "-submenu")

      document.querySelectorAll(".submenu").forEach((menu) => {
        if (menu !== submenu) {
          menu.classList.remove("show")
        }
      })

      menuLinks.forEach((otherLink) => {
        if (otherLink !== this) {
          otherLink.classList.remove("active")
        }
      })

      submenu.classList.toggle("show")
      this.classList.toggle("active")
    })
  })

  // Manejo de opciones del submenu
  submenuLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault()
      const page = this.getAttribute("data-page")

      if (page === "convertidor") {
        loadConvertidor()
      } else if (page === "biseccion") {
        loadBiseccion()
      } else if (page === "regula-falsi") {
        loadRegulaFalsi()
      } else if (page === "regula-falsi-modificada") {
        loadRegulaFalsiModificada()
      } else if (page === "newton") {
        loadNewton()
      } else if (page === "secante") {
        loadSecante()
      } else if (page === "punto-fijo") {
        loadPuntoFijo()
      } else if (page === "comparar") {
        loadComparar()
      }
    })
  })

  function cleanupContainer(container) {
    if (!container) return
    const clone = container.cloneNode(false)
    container.parentNode.replaceChild(clone, container)
    return clone
  }

  function showHomePage() {
    document.getElementById("content-container").style.display = "block"
    document.getElementById("convertidor-page").style.display = "none"
    document.getElementById("biseccion-page").style.display = "none"
    document.getElementById("regula-falsi-page").style.display = "none"
    document.getElementById("regula-falsi-modificada-page").style.display = "none"
    document.getElementById("newton-page").style.display = "none"
    document.getElementById("secante-page").style.display = "none"
    document.getElementById("punto-fijo-page").style.display = "none"
    document.getElementById("comparar-page").style.display = "none" // Added comparar page to hide list

    // Remover clase active de todos los menu-links
    menuLinks.forEach((link) => {
      link.classList.remove("active")
    })

    // Cerrar todos los submenús
    document.querySelectorAll(".submenu").forEach((menu) => {
      menu.classList.remove("show")
    })
  }

  async function loadConvertidor() {
    const pageContainer = document.getElementById("convertidor-page")
    console.log("[v0] Cargando convertidor...")

    try {
      const cleanContainer = cleanupContainer(pageContainer)

      const response = await fetch("modules/convertidor/convertidor.html")
      const html = await response.text()
      cleanContainer.innerHTML = html

      // Mostrar la página
      document.getElementById("content-container").style.display = "none"
      document.getElementById("biseccion-page").style.display = "none"
      document.getElementById("regula-falsi-page").style.display = "none"
      document.getElementById("regula-falsi-modificada-page").style.display = "none"
      document.getElementById("newton-page").style.display = "none"
      document.getElementById("secante-page").style.display = "none"
      document.getElementById("punto-fijo-page").style.display = "none"
      document.getElementById("comparar-page").style.display = "none" // Added comparar page to hide list
      cleanContainer.style.display = "block"

      if (typeof window.initializeConversor === "function") {
        window.initializeConversor()
      } else {
        console.error("[v0] initializeConversor no disponible")
      }
    } catch (error) {
      console.error("[v0] Error cargando el convertidor:", error)
      pageContainer.innerHTML = "<p>Error al cargar el convertidor</p>"
    }
  }

  async function loadBiseccion() {
    const pageContainer = document.getElementById("biseccion-page")
    console.log("[v0] Cargando página de bisección...")

    try {
      const cleanContainer = cleanupContainer(pageContainer)

      const response = await fetch("modules/biseccion/biseccion.html")
      const html = await response.text()
      cleanContainer.innerHTML = html
      console.log("[v0] HTML de bisección cargado")

      // Mostrar la página
      document.getElementById("content-container").style.display = "none"
      document.getElementById("convertidor-page").style.display = "none"
      document.getElementById("regula-falsi-page").style.display = "none"
      document.getElementById("regula-falsi-modificada-page").style.display = "none"
      document.getElementById("newton-page").style.display = "none"
      document.getElementById("secante-page").style.display = "none"
      document.getElementById("punto-fijo-page").style.display = "none"
      document.getElementById("comparar-page").style.display = "none" // Added comparar page to hide list
      cleanContainer.style.display = "block"
      console.log("[v0] Página de bisección mostrada")

      // Verificar que la función esté disponible
      if (typeof window.initializeBiseccion === "function") {
        console.log("[v0] Llamando a initializeBiseccion...")
        window.initializeBiseccion()
      } else {
        console.error("[v0] ERROR: window.initializeBiseccion no es una función")
      }
    } catch (error) {
      console.error("[v0] Error cargando bisección:", error)
      pageContainer.innerHTML = "<p>Error al cargar el módulo de bisección</p>"
    }
  }

  async function loadRegulaFalsi() {
    const pageContainer = document.getElementById("regula-falsi-page")

    try {
      const cleanContainer = cleanupContainer(pageContainer)

      const response = await fetch("modules/regula-falsi/regula-falsi.html")
      const html = await response.text()
      cleanContainer.innerHTML = html

      // Mostrar la página
      document.getElementById("content-container").style.display = "none"
      document.getElementById("convertidor-page").style.display = "none"
      document.getElementById("biseccion-page").style.display = "none"
      document.getElementById("regula-falsi-modificada-page").style.display = "none"
      document.getElementById("newton-page").style.display = "none"
      document.getElementById("secante-page").style.display = "none"
      document.getElementById("punto-fijo-page").style.display = "none"
      document.getElementById("comparar-page").style.display = "none" // Added comparar page to hide list
      cleanContainer.style.display = "block"

      if (typeof window.initializeRegulaFalsi === "function") {
        window.initializeRegulaFalsi()
      } else {
        console.error("[v0] window.initializeRegulaFalsi no está disponible")
      }
    } catch (error) {
      console.error("[v0] Error cargando Regula Falsi:", error)
      pageContainer.innerHTML = "<p>Error al cargar el módulo de Regula Falsi</p>"
    }
  }

  async function loadRegulaFalsiModificada() {
    const pageContainer = document.getElementById("regula-falsi-modificada-page")

    try {
      const cleanContainer = cleanupContainer(pageContainer)

      const response = await fetch("modules/regula-falsi-modificada/regula-falsi-modificada.html")
      const html = await response.text()
      cleanContainer.innerHTML = html

      // Mostrar la página
      document.getElementById("content-container").style.display = "none"
      document.getElementById("convertidor-page").style.display = "none"
      document.getElementById("biseccion-page").style.display = "none"
      document.getElementById("regula-falsi-page").style.display = "none"
      document.getElementById("newton-page").style.display = "none"
      document.getElementById("secante-page").style.display = "none"
      document.getElementById("punto-fijo-page").style.display = "none"
      document.getElementById("comparar-page").style.display = "none" // Added comparar page to hide list
      cleanContainer.style.display = "block"

      if (typeof window.initializeRegulaFalsiModificada === "function") {
        window.initializeRegulaFalsiModificada()
      } else {
        console.error("[v0] window.initializeRegulaFalsiModificada no está disponible")
      }
    } catch (error) {
      console.error("[v0] Error cargando Regula Falsi Modificada:", error)
      pageContainer.innerHTML = "<p>Error al cargar el módulo de Regula Falsi Modificada</p>"
    }
  }

  async function loadNewton() {
    const pageContainer = document.getElementById("newton-page")
    console.log("[v0] Cargando página de Newton...")

    try {
      const cleanContainer = cleanupContainer(pageContainer)

      const response = await fetch("modules/newton-raphson/newton.html")
      const html = await response.text()
      cleanContainer.innerHTML = html
      console.log("[v0] HTML de Newton cargado")

      // Mostrar la página
      document.getElementById("content-container").style.display = "none"
      document.getElementById("convertidor-page").style.display = "none"
      document.getElementById("biseccion-page").style.display = "none"
      document.getElementById("regula-falsi-page").style.display = "none"
      document.getElementById("regula-falsi-modificada-page").style.display = "none"
      document.getElementById("secante-page").style.display = "none"
      document.getElementById("punto-fijo-page").style.display = "none"
      document.getElementById("comparar-page").style.display = "none" // Added comparar page to hide list
      cleanContainer.style.display = "block"
      console.log("[v0] Página de Newton mostrada")

      // Verificar que la función esté disponible
      if (typeof window.initializeNewton === "function") {
        console.log("[v0] Llamando a initializeNewton...")
        window.initializeNewton()
      } else {
        console.error("[v0] ERROR: window.initializeNewton no es una función")
      }
    } catch (error) {
      console.error("[v0] Error cargando Newton:", error)
      pageContainer.innerHTML = "<p>Error al cargar el módulo de Newton</p>"
    }
  }

  async function loadSecante() {
    const pageContainer = document.getElementById("secante-page")
    console.log("[v0] Cargando página de Secante...")

    try {
      const cleanContainer = cleanupContainer(pageContainer)

      const response = await fetch("modules/secante/secante.html")
      const html = await response.text()
      cleanContainer.innerHTML = html
      console.log("[v0] HTML de Secante cargado")

      // Mostrar la página
      document.getElementById("content-container").style.display = "none"
      document.getElementById("convertidor-page").style.display = "none"
      document.getElementById("biseccion-page").style.display = "none"
      document.getElementById("regula-falsi-page").style.display = "none"
      document.getElementById("regula-falsi-modificada-page").style.display = "none"
      document.getElementById("newton-page").style.display = "none"
      document.getElementById("punto-fijo-page").style.display = "none"
      document.getElementById("comparar-page").style.display = "none" // Added comparar page to hide list
      cleanContainer.style.display = "block"
      console.log("[v0] Página de Secante mostrada")

      // Verificar que la función esté disponible
      if (typeof window.initializeSecante === "function") {
        console.log("[v0] Llamando a initializeSecante...")
        window.initializeSecante()
      } else {
        console.error("[v0] ERROR: window.initializeSecante no es una función")
      }
    } catch (error) {
      console.error("[v0] Error cargando Secante:", error)
      pageContainer.innerHTML = "<p>Error al cargar el módulo de Secante</p>"
    }
  }

  async function loadPuntoFijo() {
    const pageContainer = document.getElementById("punto-fijo-page")
    console.log("[v0] Cargando página de Punto Fijo...")

    try {
      const cleanContainer = cleanupContainer(pageContainer)

      const response = await fetch("modules/punto-fijo/punto-fijo.html")
      const html = await response.text()
      cleanContainer.innerHTML = html
      console.log("[v0] HTML de Punto Fijo cargado")

      // Mostrar la página
      document.getElementById("content-container").style.display = "none"
      document.getElementById("convertidor-page").style.display = "none"
      document.getElementById("biseccion-page").style.display = "none"
      document.getElementById("regula-falsi-page").style.display = "none"
      document.getElementById("regula-falsi-modificada-page").style.display = "none"
      document.getElementById("newton-page").style.display = "none"
      document.getElementById("secante-page").style.display = "none"
      document.getElementById("comparar-page").style.display = "none" // Added comparar page to hide list
      cleanContainer.style.display = "block"
      console.log("[v0] Página de Punto Fijo mostrada")

      // Verificar que la función esté disponible
      if (typeof window.initializePuntoFijo === "function") {
        console.log("[v0] Llamando a initializePuntoFijo...")
        window.initializePuntoFijo()
      } else {
        console.error("[v0] ERROR: window.initializePuntoFijo no es una función")
      }
    } catch (error) {
      console.error("[v0] Error cargando Punto Fijo:", error)
      pageContainer.innerHTML = "<p>Error al cargar el módulo de Punto Fijo</p>"
    }
  }

  async function loadComparar() {
    const pageContainer = document.getElementById("comparar-page")
    console.log("[v0] Cargando página de Comparar...")

    try {
      const cleanContainer = cleanupContainer(pageContainer)

      const response = await fetch("modules/comparar/comparar.html")
      const html = await response.text()
      cleanContainer.innerHTML = html
      console.log("[v0] HTML de Comparar cargado")

      // Mostrar la página
      document.getElementById("content-container").style.display = "none"
      document.getElementById("convertidor-page").style.display = "none"
      document.getElementById("biseccion-page").style.display = "none"
      document.getElementById("regula-falsi-page").style.display = "none"
      document.getElementById("regula-falsi-modificada-page").style.display = "none"
      document.getElementById("newton-page").style.display = "none"
      document.getElementById("secante-page").style.display = "none"
      document.getElementById("punto-fijo-page").style.display = "none"
      cleanContainer.style.display = "block"
      console.log("[v0] Página de Comparar mostrada")

      // Verificar que la función esté disponible
      if (typeof window.initializeComparar === "function") {
        console.log("[v0] Llamando a initializeComparar...")
        window.initializeComparar()
      } else {
        console.error("[v0] ERROR: window.initializeComparar no es una función")
      }
    } catch (error) {
      console.error("[v0] Error cargando Comparar:", error)
      pageContainer.innerHTML = "<p>Error al cargar el módulo de Comparar</p>"
    }
  }

  // Función para mostrar página
  function showPage(pageId) {
    document.querySelectorAll(".page-content").forEach((page) => {
      page.style.display = "none"
    })
    document.getElementById("content-container").style.display = "none"
    document.getElementById(pageId).style.display = "block"
  }
})

function copyToClipboard(element) {
  const code = element.querySelector("code").textContent
  navigator.clipboard.writeText(code).then(() => {
    const icon = element.querySelector("i")
    const originalClass = icon.className
    icon.className = "fas fa-check"
    icon.style.color = "#51cf66"

    setTimeout(() => {
      icon.className = originalClass
      icon.style.color = ""
    }, 2000)
  })
}

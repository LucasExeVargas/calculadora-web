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
      } else if (page === "division") {
        loadDivision()
      } else if (page === "biseccion") {
        loadBiseccion()
      } else if (page === "regula-falsi") {
        loadRegulaFalsi()
      } else if (page === "regula-falsi-modificada") {
        loadRegulaFalsiModificada()
      } else if (page === "newton") {
        loadNewton()
      } else if (page === "halley") {
        loadHalley()
      } else if (page === "secante") {
        loadSecante()
      } else if (page === "punto-fijo") {
        loadPuntoFijo()
      } else if (page === "polinomio") {
        loadPolinomio()
      } else if (page === "raices-enteras") {
        loadRaicesEnteras()
      } else if (page === "raices-racionales") {
        loadRaicesRacionales()
      } else if (page === "comparar") {
        loadComparar()
      } else if (page === "horner-doble") {
        loadHornerDoble()
      }else if (page === "lagrange") {
        loadLagrange()
      }else if (page === "laguerre") {
        loadLaguerre()
      }else if (page === "newton-cotas") {
        loadNewtonCotas()
      } else if (page === "bairstow") {
        loadBairstow()
      } else if (page === "normas-vectores") {
        loadNormasVectores()
      }

    })
  })

  function hideAllPages() {
    // Ocultar todas las páginas
    const pages = [
      "content-container",
      "convertidor-page",
      "biseccion-page",
      "regula-falsi-page",
      "regula-falsi-modificada-page",
      "newton-page",
      "secante-page",
      "punto-fijo-page",
      "comparar-page",
      "polinomio-page",
      "raices-enteras-page",
      "raices-racionales-page",
      "division-page",
      "horner-doble-page",
      "halley-page",
      "lagrange-page",
      "laguerre-page",
      "newton-cotas-page",
      "bairstow-page",
      "normas-vectores-page"
// ← AGREGAR ESTA LÍNEA
    ]
    
    pages.forEach(pageId => {
      const page = document.getElementById(pageId)
      if (page) {
        page.style.display = "none"
      }
    })
  }

  function cleanupContainer(container) {
    if (!container) return
    hideAllPages() // Ocultar todas las páginas antes de mostrar la nueva
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
    document.getElementById("comparar-page").style.display = "none"
    document.getElementById("polinomio-page").style.display = "none"
    document.getElementById("raices-enteras-page").style.display = "none"
    document.getElementById("raices-racionales-page").style.display = "none"
    document.getElementById("division-page").style.display = "none"
    document.getElementById("horner-doble-page").style.display = "none"
    document.getElementById("halley-page").style.display = "none" 
    document.getElementById("lagrange-page").style.display = "none"
    document.getElementById("laguerre-page").style.display = "none"
    document.getElementById("newton-cotas-page").style.display = "none"
    document.getElementById("bairstow-page").style.display = "none"
    document.getElementById( "normas-vectores-page").style.display = "none"/// ← AGREGAR ESTA LÍNEA

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
      document.getElementById("comparar-page").style.display = "none"
      document.getElementById("polinomio-page").style.display = "none"
      document.getElementById("division-page").style.display = "none"
      document.getElementById("horner-doble-page").style.display = "none"
      document.getElementById("halley-page").style.display = "none"
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

  async function loadRaicesEnteras() {
    const pageContainer = document.getElementById("raices-enteras-page")
    console.log('[v0] Cargando página de Raíces Enteras...')

    try {
      const cleanContainer = cleanupContainer(pageContainer)

      const response = await fetch('modules/raices-enteras/raices-enteras.html')
      const html = await response.text()
      cleanContainer.innerHTML = html

      // Mostrar la página
      cleanContainer.style.display = 'block'

      if (typeof window.initializeRaicesEnteras === 'function') {
        window.initializeRaicesEnteras()
      } else {
        console.error('[v0] initializeRaicesEnteras no disponible')
      }
    } catch (error) {
      console.error('[v0] Error cargando Raices Enteras:', error)
      pageContainer.innerHTML = "<p>Error al cargar el módulo de Raíces Enteras</p>"
    }
  }

  async function loadRaicesRacionales() {
    const pageContainer = document.getElementById("raices-racionales-page")
    console.log('[v0] Cargando página de Raíces Racionales...')

    try {
      const cleanContainer = cleanupContainer(pageContainer)

      const response = await fetch('modules/raices-racionales/raices-racionales.html')
      const html = await response.text()
      cleanContainer.innerHTML = html

      // Mostrar la página
      cleanContainer.style.display = 'block'

      if (typeof window.initializeRaicesRacionales === 'function') {
        window.initializeRaicesRacionales()
      } else {
        console.error('[v0] initializeRaicesRacionales no disponible')
      }
    } catch (error) {
      console.error('[v0] Error cargando Raices Racionales:', error)
      pageContainer.innerHTML = "<p>Error al cargar el módulo de Raíces Racionales</p>"
    }
  }

  async function loadDivision() {
    const pageContainer = document.getElementById("division-page")
    console.log("[v0] Cargando página de División de Polinomios...")

    try {
      const cleanContainer = cleanupContainer(pageContainer)

      const response = await fetch("modules/division/division.html")
      const html = await response.text()
      cleanContainer.innerHTML = html

      // Mostrar la página
      cleanContainer.style.display = "block"

      if (typeof window.initializeDivision === "function") {
        window.initializeDivision()
      } else {
        console.error("[v0] initializeDivision no disponible")
      }
    } catch (error) {
      console.error("[v0] Error cargando División:", error)
      pageContainer.innerHTML = "<p>Error al cargar el módulo de División</p>"
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
      document.getElementById("comparar-page").style.display = "none"
      document.getElementById("polinomio-page").style.display = "none"
      document.getElementById("division-page").style.display = "none"
      document.getElementById("horner-doble-page").style.display = "none"
      document.getElementById("halley-page").style.display = "none"
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
      document.getElementById("comparar-page").style.display = "none"
      document.getElementById("polinomio-page").style.display = "none"
      document.getElementById("division-page").style.display = "none"
      document.getElementById("horner-doble-page").style.display = "none"
      document.getElementById("halley-page").style.display = "none"
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
      document.getElementById("comparar-page").style.display = "none"
      document.getElementById("polinomio-page").style.display = "none"
      document.getElementById("division-page").style.display = "none"
      document.getElementById("horner-doble-page").style.display = "none"
      document.getElementById("halley-page").style.display = "none"
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
      document.getElementById("comparar-page").style.display = "none"
      document.getElementById("polinomio-page").style.display = "none"
      document.getElementById("division-page").style.display = "none"
      document.getElementById("horner-doble-page").style.display = "none"
      document.getElementById("halley-page").style.display = "none"
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

  async function loadHalley() {
    const pageContainer = document.getElementById("halley-page")
    console.log("[v0] Cargando página de Halley...")

    try {
      const cleanContainer = cleanupContainer(pageContainer)

      const response = await fetch("modules/halley/halley.html")
      const html = await response.text()
      cleanContainer.innerHTML = html
      console.log("[v0] HTML de Halley cargado")

      // Mostrar la página
      document.getElementById("content-container").style.display = "none"
      document.getElementById("convertidor-page").style.display = "none"
      document.getElementById("biseccion-page").style.display = "none"
      document.getElementById("regula-falsi-page").style.display = "none"
      document.getElementById("regula-falsi-modificada-page").style.display = "none"
      document.getElementById("newton-page").style.display = "none"
      document.getElementById("secante-page").style.display = "none"
      document.getElementById("punto-fijo-page").style.display = "none"
      document.getElementById("comparar-page").style.display = "none"
      document.getElementById("polinomio-page").style.display = "none"
      document.getElementById("division-page").style.display = "none"
      document.getElementById("horner-doble-page").style.display = "none"
      cleanContainer.style.display = "block"
      console.log("[v0] Página de Halley mostrada")

      if (typeof window.initializeHalley === "function") {
        console.log("[v0] Llamando a initializeHalley...")
        window.initializeHalley()
      } else {
        console.error("[v0] ERROR: window.initializeHalley no es una función")
      }
    } catch (error) {
      console.error("[v0] Error cargando Halley:", error)
      pageContainer.innerHTML = "<p>Error al cargar el módulo de Halley</p>"
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
      document.getElementById("comparar-page").style.display = "none"
      document.getElementById("polinomio-page").style.display = "none"
      document.getElementById("division-page").style.display = "none"
      document.getElementById("horner-doble-page").style.display = "none"
      document.getElementById("halley-page").style.display = "none"
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
      document.getElementById("comparar-page").style.display = "none"
      document.getElementById("polinomio-page").style.display = "none"
      document.getElementById("division-page").style.display = "none"
      document.getElementById("horner-doble-page").style.display = "none"
      document.getElementById("halley-page").style.display = "none"
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
      document.getElementById("polinomio-page").style.display = "none"
      document.getElementById("division-page").style.display = "none"
      document.getElementById("horner-doble-page").style.display = "none"
      document.getElementById("halley-page").style.display = "none"
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

  async function loadPolinomio() {
    const pageContainer = document.getElementById("polinomio-page")
    console.log("[v0] Cargando página de Polinomio...")

    try {
      const cleanContainer = cleanupContainer(pageContainer)

      const response = await fetch("modules/polinomio/polinomio.html")
      const html = await response.text()
      cleanContainer.innerHTML = html

      // Mostrar la página
      cleanContainer.style.display = "block"

      if (typeof window.initializePolinomio === "function") {
        window.initializePolinomio()
      } else {
        console.error("[v0] initializePolinomio no disponible")
      }
    } catch (error) {
      console.error("[v0] Error cargando Polinomio:", error)
      pageContainer.innerHTML = "<p>Error al cargar el módulo de Polinomio</p>"
    }
  }

  async function loadHornerDoble() {
    const pageContainer = document.getElementById("horner-doble-page")
    console.log('[v0] Cargando página de Horner Doble...')

    try {
      const cleanContainer = cleanupContainer(pageContainer)

      const response = await fetch("modules/horner-doble/horner-doble.html")
      const html = await response.text()
      cleanContainer.innerHTML = html

      // Mostrar la página
      cleanContainer.style.display = 'block'

      if (typeof window.initializeHornerDoble === 'function') {
        window.initializeHornerDoble()
      } else {
        console.error('[v0] initializeHornerDoble no disponible')
      }
    } catch (error) {
      console.error('[v0] Error cargando Horner Doble:', error)
      pageContainer.innerHTML = "<p>Error al cargar el módulo de Horner Doble</p>"
    }
  }
  async function loadLagrange() {
    const pageContainer = document.getElementById("lagrange-page")
    console.log("[v0] Cargando página de Lagrange...")

    try {
      const cleanContainer = cleanupContainer(pageContainer)

      const response = await fetch("modules/lagrange/lagrange.html")
      const html = await response.text()
      cleanContainer.innerHTML = html

      // Mostrar la página
      cleanContainer.style.display = "block"

      if (typeof window.initializeLagrange === "function") {
        window.initializeLagrange()
      } else {
        console.error("[v0] initializeLagrange no disponible")
      }
    } catch (error) {
      console.error("[v0] Error cargando Lagrange:", error)
      pageContainer.innerHTML = "<p>Error al cargar el módulo de Lagrange</p>"
    }
  }
  async function loadLaguerre() {
    const pageContainer = document.getElementById("laguerre-page");
    console.log("[v0] Cargando página de Laguerre...");

    try {
      // Limpiar contenedor
      const cleanContainer = cleanupContainer(pageContainer);

      // Cargar HTML
      const response = await fetch("modules/laguerre/laguerre.html");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const html = await response.text();
      cleanContainer.innerHTML = html;

      // Ocultar todas las páginas y mostrar esta
      hideAllPages();
      cleanContainer.style.display = "block";

      // Inicializar el módulo
      if (typeof window.initializeLaguerre === "function") {
        window.initializeLaguerre();
      } else {
        console.error("[v0] ERROR: initializeLaguerre no es una función");
        console.log("[v0] window.initializeLaguerre:", typeof window.initializeLaguerre);
      }
    } catch (error) {
      console.error("[v0] Error cargando Laguerre:", error);
      pageContainer.innerHTML = `
        <div class="content-header">
          <h1>Error</h1>
          <p>No se pudo cargar el módulo de Laguerre: ${error.message}</p>
        </div>
      `;
    }
  }
  async function loadNewtonCotas() {
    const pageContainer = document.getElementById("newton-cotas-page")
    console.log("[v0] Cargando página de Newton Cotas...")

    try {
      const cleanContainer = cleanupContainer(pageContainer)

      const response = await fetch("modules/newton-cotas/newton-cotas.html")
      const html = await response.text()
      cleanContainer.innerHTML = html

      // Mostrar la página
      hideAllPages()
      cleanContainer.style.display = "block"

      if (typeof window.initializeNewtonCotas === "function") {
        window.initializeNewtonCotas()
      } else {
        console.error("[v0] initializeNewtonCotas no está disponible")
      }
    } catch (error) {
      console.error("[v0] Error cargando Newton Cotas:", error)
      pageContainer.innerHTML = "<p>Error cargando el módulo de Newton Cotas</p>"
    }
  }
  async function loadBairstow() {
    const pageContainer = document.getElementById("bairstow-page")
    console.log("[v0] Cargando página de Bairstow...")

    try {
      const cleanContainer = cleanupContainer(pageContainer)

      const response = await fetch("modules/bairstow/bairstow.html")
      const html = await response.text()
      cleanContainer.innerHTML = html

      // Mostrar la página
      hideAllPages()
      cleanContainer.style.display = "block"

      if (typeof window.initializeBairstow === "function") {
        window.initializeBairstow()
      } else {
        console.error("[v0] initializeBairstow no está disponible")
      }
    } catch (error) {
      console.error("[v0] Error cargando Bairstow:", error)
      pageContainer.innerHTML = "<p>Error cargando el módulo de Bairstow</p>"
    }
  }
  async function loadNormasVectores() {
    const pageContainer = document.getElementById("normas-vectores-page");
    console.log("[v0] Cargando página de Normas de Vectores...");

    try {
        const cleanContainer = cleanupContainer(pageContainer);

        const response = await fetch("modules/normas-vectores/normas-vectores.html");
        const html = await response.text();
        cleanContainer.innerHTML = html;

        hideAllPages();
        cleanContainer.style.display = "block";

        if (typeof window.initializeNormasVectores === "function") {
            window.initializeNormasVectores();
        } else {
            console.error("[v0] initializeNormasVectores no está disponible");
        }
    } catch (error) {
        console.error("[v0] Error cargando Normas de Vectores:", error);
        pageContainer.innerHTML = "<p>Error al cargar el módulo de Normas de Vectores</p>";
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
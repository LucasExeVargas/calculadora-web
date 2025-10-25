document.addEventListener("DOMContentLoaded", () => {
  const menuLinks = document.querySelectorAll(".menu-link")
  const submenuLinks = document.querySelectorAll(".submenu-link")

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
      }
    })
  })

  async function loadConvertidor() {
    const pageContainer = document.getElementById("convertidor-page")

    try {
      const response = await fetch("modules/convertidor/convertidor.html")
      const html = await response.text()
      pageContainer.innerHTML = html

      // Mostrar la página
      document.getElementById("content-container").style.display = "none"
      document.getElementById("biseccion-page").style.display = "none"
      document.getElementById("regula-falsi-page").style.display = "none"
      document.getElementById("regula-falsi-modificada-page").style.display = "none"
      pageContainer.style.display = "block"

      initializeConversor()
    } catch (error) {
      console.error("[v0] Error cargando el convertidor:", error)
      pageContainer.innerHTML = "<p>Error al cargar el convertidor</p>"
    }
  }

  async function loadBiseccion() {
    const pageContainer = document.getElementById("biseccion-page")

    try {
      const response = await fetch("modules/biseccion/biseccion.html")
      const html = await response.text()
      pageContainer.innerHTML = html

      // Mostrar la página
      document.getElementById("content-container").style.display = "none"
      document.getElementById("convertidor-page").style.display = "none"
      document.getElementById("regula-falsi-page").style.display = "none"
      document.getElementById("regula-falsi-modificada-page").style.display = "none"
      pageContainer.style.display = "block"

      initializeBiseccion()
    } catch (error) {
      console.error("[v0] Error cargando bisección:", error)
      pageContainer.innerHTML = "<p>Error al cargar el módulo de bisección</p>"
    }
  }

  async function loadRegulaFalsi() {
    const pageContainer = document.getElementById("regula-falsi-page")

    try {
      const response = await fetch("modules/regula-falsi/regula-falsi.html")
      const html = await response.text()
      pageContainer.innerHTML = html

      // Mostrar la página
      document.getElementById("content-container").style.display = "none"
      document.getElementById("convertidor-page").style.display = "none"
      document.getElementById("biseccion-page").style.display = "none"
      document.getElementById("regula-falsi-modificada-page").style.display = "none"
      pageContainer.style.display = "block"

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
      const response = await fetch("modules/regula-falsi-modificada/regula-falsi-modificada.html")
      const html = await response.text()
      pageContainer.innerHTML = html

      // Mostrar la página
      document.getElementById("content-container").style.display = "none"
      document.getElementById("convertidor-page").style.display = "none"
      document.getElementById("biseccion-page").style.display = "none"
      document.getElementById("regula-falsi-page").style.display = "none"
      pageContainer.style.display = "block"

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

  function initializeConversor() {
    const convertBtn = document.getElementById("convert-btn")
    const inputNumber = document.getElementById("input-number")
    const inputBase = document.getElementById("input-base")
    const outputBase = document.getElementById("output-base")
    const precision = document.getElementById("precision")
    const errorIcon = document.getElementById("error-icon")
    const errorMessage = document.getElementById("error-message")
    const resultsSection = document.getElementById("results-section")

    console.log("[v0] Inicializando convertidor...")

    if (!convertBtn || !inputNumber) {
      console.error("[v0] Elementos del convertidor no encontrados")
      return
    }

    // Permitir Enter en el campo de entrada
    inputNumber.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        console.log("[v0] Enter presionado")
        convertBtn.click()
      }
    })

    convertBtn.addEventListener("click", () => {
      console.log("[v0] Botón Pulsa presionado")
      const number = inputNumber.value.trim()
      const inBase = Number.parseInt(inputBase.value)
      const outBase = Number.parseInt(outputBase.value)
      const prec = Number.parseInt(precision.value)

      console.log(`[v0] Entrada: ${number}, Base entrada: ${inBase}, Base salida: ${outBase}, Precisión: ${prec}`)

      // Limpiar errores previos
      errorIcon.style.display = "none"
      errorMessage.style.display = "none"

      // Validar entrada
      if (!number) {
        showError("Por favor, introduce un número")
        return
      }

      // Validar que el número sea válido para la base especificada
      const validationError = validateNumber(number, inBase)
      if (validationError) {
        console.log("[v0] Error de validación:", validationError)
        showError(validationError)
        return
      }

      // Realizar conversión
      try {
        const results = convertNumber(number, inBase, outBase, prec)
        console.log("[v0] Conversión exitosa:", results)
        displayResults(results)
        resultsSection.style.display = "block"
      } catch (error) {
        console.error("[v0] Error en la conversión:", error)
        showError("Error en la conversión: " + error.message)
      }
    })

    function showError(message) {
      console.log("[v0] Mostrando error:", message)
      errorIcon.style.display = "block"
      errorMessage.style.display = "block"
      errorMessage.textContent = message
      resultsSection.style.display = "none"
    }

    function validateNumber(number, base) {
      const upperNumber = number.toUpperCase()
      const validChars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ".substring(0, base)

      // Verificar si contiene punto (separador decimal)
      const parts = upperNumber.split(".")
      if (parts.length > 2) {
        return "El número no puede contener más de un punto decimal"
      }

      // Validar cada parte
      for (const part of parts) {
        if (!part) {
          return "Formato inválido: no puede haber puntos al inicio o final"
        }
        for (const char of part) {
          if (!validChars.includes(char)) {
            return `El dígito '${char}' no es válido en base ${base}. Dígitos válidos: ${validChars}`
          }
        }
      }

      return null
    }

    function convertNumber(number, inBase, outBase, precision) {
      const upperNumber = number.toUpperCase()
      const [integerPart, decimalPart] = upperNumber.split(".")

      // Convertir parte entera a decimal
      let decimalInteger = 0
      for (let i = 0; i < integerPart.length; i++) {
        const digit = integerPart.charCodeAt(i) - (integerPart[i] >= "A" ? 55 : 48)
        decimalInteger = decimalInteger * inBase + digit
      }

      // Convertir parte decimal a decimal
      let decimalDecimal = 0
      if (decimalPart) {
        for (let i = 0; i < decimalPart.length; i++) {
          const digit = decimalPart.charCodeAt(i) - (decimalPart[i] >= "A" ? 55 : 48)
          decimalDecimal += digit / Math.pow(inBase, i + 1)
        }
      }

      // Convertir a la base de salida
      const integerResult = convertIntegerToBase(decimalInteger, outBase)
      const decimalResult = convertDecimalToBase(decimalDecimal, outBase, precision * 2)

      // Resultados sin precisión
      const noNormalized = integerResult + (decimalResult ? "." + decimalResult : "")
      const normalized = normalizeFloatingPoint(noNormalized, outBase)

      // Resultados con precisión (corte)
      const decimalResultCut = convertDecimalToBase(decimalDecimal, outBase, precision)
      const cutNoNormalized = integerResult + (decimalResultCut ? "." + decimalResultCut : "")
      const cutNormalized = normalizeFloatingPoint(cutNoNormalized, outBase)

      // Resultados con precisión (redondeo simétrico)
      const decimalResultRounded = roundSymmetric(decimalDecimal, outBase, precision)
      const roundNoNormalized = integerResult + (decimalResultRounded ? "." + decimalResultRounded : "")
      const roundNormalized = normalizeFloatingPoint(roundNoNormalized, outBase)

      return {
        noNormalized,
        normalized,
        cutNoNormalized,
        cutNormalized,
        roundNoNormalized,
        roundNormalized,
      }
    }

    function convertIntegerToBase(num, base) {
      if (num === 0) return "0"
      let result = ""
      while (num > 0) {
        const digit = num % base
        result = (digit < 10 ? digit : String.fromCharCode(55 + digit)) + result
        num = Math.floor(num / base)
      }
      return result
    }

    function convertDecimalToBase(num, base, maxDigits) {
      if (num === 0) return ""
      let result = ""
      let count = 0
      while (num > 0 && count < maxDigits) {
        num *= base
        const digit = Math.floor(num)
        result += digit < 10 ? digit : String.fromCharCode(55 + digit)
        num -= digit
        count++
      }
      return result
    }

    function roundSymmetric(num, base, precision) {
      const result = convertDecimalToBase(num, base, precision + 1)
      if (result.length <= precision) return result

      const truncated = result.substring(0, precision)
      const nextDigit = Number.parseInt(result[precision], base)
      const halfBase = base / 2

      if (nextDigit >= halfBase) {
        return incrementBase(truncated, base)
      }
      return truncated
    }

    function incrementBase(str, base) {
      const result = str.split("")
      let carry = 1

      for (let i = result.length - 1; i >= 0 && carry; i--) {
        const digit = Number.parseInt(result[i], base) + carry
        if (digit >= base) {
          result[i] = "0"
          carry = 1
        } else {
          result[i] = digit < 10 ? digit.toString() : String.fromCharCode(55 + digit)
          carry = 0
        }
      }

      return carry ? "1" + result.join("") : result.join("")
    }

    function normalizeFloatingPoint(number, base) {
      const [intPart, decPart] = number.split(".")

      // Si la parte entera es 0 y hay parte decimal
      if (intPart === "0" && decPart) {
        // Encontrar el primer dígito no cero
        let firstNonZero = 0
        for (let i = 0; i < decPart.length; i++) {
          if (decPart[i] !== "0") {
            firstNonZero = i + 1
            break
          }
        }
        if (firstNonZero > 0) {
          const exponent = -firstNonZero
          const mantissa = "0." + decPart.substring(0, firstNonZero) + decPart.substring(firstNonZero)
          return `${mantissa} x ${base}^${exponent}`
        }
      }

      // Si hay parte entera
      if (intPart !== "0") {
        const exponent = intPart.length - 1
        const mantissa = intPart[0] + (decPart ? "." + decPart : "")
        return `${mantissa} x ${base}^${exponent}`
      }

      return number
    }

    function displayResults(results) {
      document.getElementById("result-no-precision-no-norm").textContent = results.noNormalized
      document.getElementById("result-no-precision-norm").textContent = results.normalized
      document.getElementById("result-cut-no-norm").textContent = results.cutNoNormalized
      document.getElementById("result-cut-norm").textContent = results.cutNormalized
      document.getElementById("result-round-no-norm").textContent = results.roundNoNormalized
      document.getElementById("result-round-norm").textContent = results.roundNormalized
    }
  }

  // Agregar función para inicializar el módulo de bisección
  function initializeBiseccion() {
    console.log("[v0] Llamando a initializeBiseccion desde script.js...")

    if (typeof window.initializeBiseccion === "function") {
      window.initializeBiseccion()
    } else {
      console.error("[v0] window.initializeBiseccion no está disponible")
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

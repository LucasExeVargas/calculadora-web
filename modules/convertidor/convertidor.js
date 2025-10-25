// Módulo del Convertidor de Bases Numéricas

class ConversorBases {
  constructor() {
    this.initialized = false
  }

  init() {
    if (this.initialized) return

    const convertBtn = document.getElementById("convert-btn")
    const inputNumber = document.getElementById("input-number")

    if (!convertBtn || !inputNumber) return

    this.initialized = true

    // Permitir Enter en el campo de entrada
    inputNumber.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        convertBtn.click()
      }
    })

    convertBtn.addEventListener("click", () => this.handleConversion())
  }

  handleConversion() {
    const number = document.getElementById("input-number").value.trim()
    const inBase = Number.parseInt(document.getElementById("input-base").value)
    const outBase = Number.parseInt(document.getElementById("output-base").value)
    const prec = Number.parseInt(document.getElementById("precision").value)

    const errorIcon = document.getElementById("error-icon")
    const errorMessage = document.getElementById("error-message")
    const resultsSection = document.getElementById("results-section")

    // Limpiar errores previos
    errorIcon.style.display = "none"
    errorMessage.style.display = "none"

    // Validar entrada
    if (!number) {
      this.showError("Por favor, introduce un número")
      return
    }

    // Validar que el número sea válido para la base especificada
    const validationError = this.validateNumber(number, inBase)
    if (validationError) {
      this.showError(validationError)
      return
    }

    // Realizar conversión
    try {
      const results = this.convertNumber(number, inBase, outBase, prec)
      this.displayResults(results)
      resultsSection.style.display = "block"
    } catch (error) {
      this.showError("Error en la conversión: " + error.message)
    }
  }

  showError(message) {
    const errorIcon = document.getElementById("error-icon")
    const errorMessage = document.getElementById("error-message")
    const resultsSection = document.getElementById("results-section")

    errorIcon.style.display = "block"
    errorMessage.style.display = "block"
    errorMessage.textContent = message
    resultsSection.style.display = "none"
  }

  validateNumber(number, base) {
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

  convertNumber(number, inBase, outBase, precision) {
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
    const integerResult = this.convertIntegerToBase(decimalInteger, outBase)
    const decimalResult = this.convertDecimalToBase(decimalDecimal, outBase, precision * 2)

    // Resultados sin precisión
    const noNormalized = integerResult + (decimalResult ? "." + decimalResult : "")
    const normalized = this.normalizeFloatingPoint(noNormalized, outBase)

    // Resultados con precisión (corte)
    const decimalResultCut = this.convertDecimalToBase(decimalDecimal, outBase, precision)
    const cutNoNormalized = integerResult + (decimalResultCut ? "." + decimalResultCut : "")
    const cutNormalized = this.normalizeFloatingPoint(cutNoNormalized, outBase)

    // Resultados con precisión (redondeo simétrico)
    const decimalResultRounded = this.roundSymmetric(decimalDecimal, outBase, precision)
    const roundNoNormalized = integerResult + (decimalResultRounded ? "." + decimalResultRounded : "")
    const roundNormalized = this.normalizeFloatingPoint(roundNoNormalized, outBase)

    return {
      noNormalized,
      normalized,
      cutNoNormalized,
      cutNormalized,
      roundNoNormalized,
      roundNormalized,
    }
  }

  convertIntegerToBase(num, base) {
    if (num === 0) return "0"
    let result = ""
    while (num > 0) {
      const digit = num % base
      result = (digit < 10 ? digit : String.fromCharCode(55 + digit)) + result
      num = Math.floor(num / base)
    }
    return result
  }

  convertDecimalToBase(num, base, maxDigits) {
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

  roundSymmetric(num, base, precision) {
    const result = this.convertDecimalToBase(num, base, precision + 1)
    if (result.length <= precision) return result

    const truncated = result.substring(0, precision)
    const nextDigit = Number.parseInt(result[precision], base)
    const halfBase = base / 2

    if (nextDigit >= halfBase) {
      return this.incrementBase(truncated, base)
    }
    return truncated
  }

  incrementBase(str, base) {
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

  normalizeFloatingPoint(number, base) {
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

  displayResults(results) {
    document.getElementById("result-no-precision-no-norm").textContent = results.noNormalized
    document.getElementById("result-no-precision-norm").textContent = results.normalized
    document.getElementById("result-cut-no-norm").textContent = results.cutNoNormalized
    document.getElementById("result-cut-norm").textContent = results.cutNormalized
    document.getElementById("result-round-no-norm").textContent = results.roundNoNormalized
    document.getElementById("result-round-norm").textContent = results.roundNormalized
  }
}

// Instancia global del conversor
const conversor = new ConversorBases()

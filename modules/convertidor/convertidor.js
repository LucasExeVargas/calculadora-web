// Módulo de Convertidor de Bases Numéricas con Punto Flotante

window.initializeConversor = () => {
  console.log("[v0] Inicializando módulo de convertidor...")

  const convertBtn = document.getElementById("convert-btn")
  const inputNumber = document.getElementById("input-number")
  const inputBase = document.getElementById("input-base")
  const outputBase = document.getElementById("output-base")
  const precision = document.getElementById("precision")

  if (!convertBtn || !inputNumber || !inputBase || !outputBase || !precision) {
    console.error("[v0] Error: No se encontraron todos los elementos necesarios")
    return
  }

  // Reemplazar botón para limpiar listeners anteriores
  const newConvertBtn = convertBtn.cloneNode(true)
  convertBtn.replaceWith(newConvertBtn)

  // Permitir Enter en el campo de número
  inputNumber.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      newConvertBtn.click()
    }
  })

  // Botón Convertir
  newConvertBtn.addEventListener("click", () => {
    const number = inputNumber.value.trim()
    const inBase = Number.parseInt(inputBase.value)
    const outBase = Number.parseInt(outputBase.value)
    const prec = Number.parseInt(precision.value)

    // Validaciones
    const validation = validateInput(number, inBase, prec)
    if (!validation.valid) {
      showError(validation.error)
      return
    }

    try {
      // Convertir a decimal primero
      const decimalValue = convertToDecimal(number, inBase)
      console.log("[v0] Valor en decimal:", decimalValue)

      // Convertir de decimal a la base destino
      const result = convertFromDecimal(decimalValue, outBase, prec)

      // Mostrar resultados
      displayResults(number, inBase, outBase, prec, result)
      hideError()
    } catch (error) {
      showError("Error en la conversión: " + error.message)
    }
  })

  console.log("[v0] Módulo de convertidor inicializado correctamente")
}

function validateInput(number, base, precision) {
  // Verificar que hay algo escrito
  if (!number || number.length === 0) {
    return { valid: false, error: "Por favor, ingrese un número" }
  }

  // Verificar que la precisión es válida
  if (isNaN(precision) || precision < 1 || precision > 100) {
    return { valid: false, error: "La precisión debe estar entre 1 y 100" }
  }

  // Verificar que el número tiene formato válido (solo dígitos y un punto)
  const parts = number.split(".")
  if (parts.length > 2) {
    return { valid: false, error: "El número no puede tener más de un punto decimal" }
  }

  // Validar que todos los caracteres sean válidos para la base
  const validChars = getValidCharsForBase(base)
  for (const char of number.toLowerCase()) {
    if (char !== "." && !validChars.includes(char)) {
      return {
        valid: false,
        error: `El carácter '${char}' no es válido para base ${base}. Caracteres válidos: ${validChars.join(", ")}`,
      }
    }
  }

  return { valid: true }
}

function getValidCharsForBase(base) {
  const chars = {
    2: ["0", "1"],
    3: ["0", "1", "2"],
    4: ["0", "1", "2", "3"],
    5: ["0", "1", "2", "3", "4"],
    6: ["0", "1", "2", "3", "4", "5"],
    7: ["0", "1", "2", "3", "4", "5", "6"],
    8: ["0", "1", "2", "3", "4", "5", "6", "7"],
    9: ["0", "1", "2", "3", "4", "5", "6", "7", "8"],
    10: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
    11: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a"],
    12: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b"],
    13: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c"],
    14: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d"],
    15: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e"],
    16: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"],
  }
  return chars[base] || []
}

function convertToDecimal(number, base) {
  const [integerPart, decimalPart] = number.split(".")

  // Convertir parte entera
  let decimalInteger = 0
  for (let i = 0; i < integerPart.length; i++) {
    const digit = Number.parseInt(integerPart[i], base)
    decimalInteger = decimalInteger * base + digit
  }

  // Convertir parte decimal
  let decimalFraction = 0
  if (decimalPart) {
    for (let i = 0; i < decimalPart.length; i++) {
      const digit = Number.parseInt(decimalPart[i], base)
      decimalFraction += digit / Math.pow(base, i + 1)
    }
  }

  return decimalInteger + decimalFraction
}

function convertFromDecimal(decimalValue, base, precision) {
  // Separar parte entera y decimal
  const integerPart = Math.floor(decimalValue)
  const fractionalPart = decimalValue - integerPart

  // Convertir parte entera
  let integerConverted = convertIntegerToBase(integerPart, base)
  if (integerConverted === "") {
    integerConverted = "0"
  }

  // Convertir parte decimal con todos los dígitos
  const allFractionalDigits = convertFractionalToBase(fractionalPart, base, precision * 2)

  // Convertir parte decimal con precisión (por corte)
  const cutFractionalDigits = allFractionalDigits.substring(0, precision)

  // Convertir parte decimal con precisión (por redondeo simétrico)
  const roundedFractionalDigits = roundSymmetric(allFractionalDigits, precision, base)

  return {
    integerPart: integerConverted,
    allFractional: allFractionalDigits,
    cutFractional: cutFractionalDigits,
    roundedFractional: roundedFractionalDigits,
  }
}

function convertIntegerToBase(num, base) {
  if (num === 0) return "0"

  let result = ""
  while (num > 0) {
    const remainder = num % base
    result = remainder.toString(base) + result
    num = Math.floor(num / base)
  }
  return result
}

function convertFractionalToBase(fraction, base, maxDigits) {
  let result = ""
  let count = 0

  while (fraction > 0 && count < maxDigits) {
    fraction *= base
    const digit = Math.floor(fraction)
    result += digit.toString(base)
    fraction -= digit
    count++
  }

  return result
}

function roundSymmetric(digits, precision, base) {
  if (digits.length <= precision) {
    return digits
  }

  // Obtener los dígitos hasta la precisión
  let result = digits.substring(0, precision)
  const nextDigit = Number.parseInt(digits[precision], base)
  const baseHalf = Math.floor(base / 2)

  // Si el siguiente dígito es >= base/2, redondear hacia arriba
  if (nextDigit >= baseHalf) {
    result = incrementFractional(result, base)
  }

  return result
}

function incrementFractional(digits, base) {
  const arr = digits.split("")
  let carry = 1

  for (let i = arr.length - 1; i >= 0 && carry > 0; i--) {
    const digit = Number.parseInt(arr[i], base) + carry
    if (digit >= base) {
      arr[i] = "0"
      carry = 1
    } else {
      arr[i] = digit.toString(base)
      carry = 0
    }
  }

  if (carry > 0) {
    arr.unshift("1")
  }

  return arr.join("")
}

function normalizeFloatingPoint(integerPart, fractionalPart, base) {
  // Punto flotante normalizado: 0.xxx × base^n donde 0 < xxx < 1
  // Esto significa que el primer dígito después del punto debe ser diferente de 0

  if (integerPart === "0" && (!fractionalPart || fractionalPart === "")) {
    return { mantissa: "0", exponent: 0 }
  }

  let mantissa = ""
  let exponent = 0

  if (integerPart !== "0") {
    // Si hay parte entera, normalizar moviendo el punto
    const intLen = integerPart.length
    mantissa = integerPart[0] + "." + integerPart.substring(1) + fractionalPart
    exponent = intLen
  } else {
    // Si no hay parte entera, buscar el primer dígito diferente de 0 en la parte decimal
    let firstNonZeroIndex = -1
    for (let i = 0; i < fractionalPart.length; i++) {
      if (fractionalPart[i] !== "0") {
        firstNonZeroIndex = i
        break
      }
    }

    if (firstNonZeroIndex === -1) {
      // Todos los dígitos son 0
      return { mantissa: "0", exponent: 0 }
    }

    mantissa = fractionalPart[firstNonZeroIndex] + "." + fractionalPart.substring(firstNonZeroIndex + 1)
    exponent = -(firstNonZeroIndex + 1)
  }

  return { mantissa, exponent }
}

function displayResults(inputNumber, inputBase, outputBase, precision, result) {
  // Mostrar información de entrada
  document.getElementById("info-input-number").textContent = inputNumber
  document.getElementById("info-input-base").textContent = `Base ${inputBase}`
  document.getElementById("info-output-base").textContent = `Base ${outputBase}`
  document.getElementById("info-precision").textContent = precision

  // Resultados con todos los dígitos
  const allUnnormalized = `${result.integerPart}.${result.allFractional} × ${outputBase}^0`
  const allNormalized = normalizeFloatingPoint(result.integerPart, result.allFractional, outputBase)
  const allNormalizedStr = `0.${allNormalized.mantissa.split(".")[1]} × ${outputBase}^${allNormalized.exponent}`

  document.getElementById("result-all-unnormalized").textContent = allUnnormalized
  document.getElementById("result-all-normalized").textContent = allNormalizedStr

  // Resultados con precisión - Por corte
  const cutUnnormalized = `${result.integerPart}.${result.cutFractional} × ${outputBase}^0`
  const cutNormalized = normalizeFloatingPoint(result.integerPart, result.cutFractional, outputBase)
  const cutNormalizedStr = `0.${cutNormalized.mantissa.split(".")[1]} × ${outputBase}^${cutNormalized.exponent}`

  document.getElementById("result-cut-unnormalized").textContent = cutUnnormalized
  document.getElementById("result-cut-normalized").textContent = cutNormalizedStr

  // Resultados con precisión - Por redondeo simétrico
  const roundUnnormalized = `${result.integerPart}.${result.roundedFractional} × ${outputBase}^0`
  const roundNormalized = normalizeFloatingPoint(result.integerPart, result.roundedFractional, outputBase)
  const roundNormalizedStr = `0.${roundNormalized.mantissa.split(".")[1]} × ${outputBase}^${roundNormalized.exponent}`

  document.getElementById("result-round-unnormalized").textContent = roundUnnormalized
  document.getElementById("result-round-normalized").textContent = roundNormalizedStr

  // Mostrar sección de resultados
  document.getElementById("results-section").style.display = "block"
}

function showError(message) {
  document.getElementById("error-message").textContent = message
  document.getElementById("error-section").style.display = "block"
  document.getElementById("results-section").style.display = "none"
}

function hideError() {
  document.getElementById("error-section").style.display = "none"
}

const STORAGE_KEY = "hackoon_ctf_current_screen_v2";

const STEP_HASHES = {
  flag1: "b2ca4476051efcae2a907098a46dc299ac77074b55cd327336604c317f79df2c",
  flag2: "cd69fa9f487f4e74fca408b3ff20e1cb271d65e74bca7693bafdc10ccb873cf2",
  finalUser: "759de58739175f6f9c7114ac493d52e4e84954c30b6aefa485e5dc9b2014592c",
  finalPassword: "bef5c4cfe9270211c877ba2d98243e20cf117f579a80a4863d9506efa799b102"
};

function showScreen(screenNumber) {
  const screens = document.querySelectorAll(".screen");
  screens.forEach((screen) => {
    screen.style.display = "none";
  });

  const target = document.getElementById(`screen-${screenNumber}`);
  if (target) {
    target.style.display = "block";
    localStorage.setItem(STORAGE_KEY, String(screenNumber));
  }
}

function getSavedScreen() {
  const saved = Number(localStorage.getItem(STORAGE_KEY));
  if (!saved || saved < 1 || saved > 5) {
    return 1;
  }
  return saved;
}

async function sha256(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text.trim());
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function validateFlagStep(stepNumber, expectedHashKey, inputId, messageId, nextScreen) {
  const input = document.getElementById(inputId);
  const message = document.getElementById(messageId);
  const value = input.value.trim();

  if (!value) {
    message.textContent = "Digite uma resposta antes de enviar.";
    return;
  }

  const expectedHash = STEP_HASHES[expectedHashKey];

  if (!expectedHash || expectedHash.startsWith("COLE_AQUI")) {
    message.textContent = "Os hashes ainda não foram configurados.";
    return;
  }

  const receivedHash = await sha256(value);

  if (receivedHash === expectedHash) {
    message.textContent = "Resposta correta!";
    showScreen(nextScreen);
  } else {
    message.textContent = "Resposta incorreta. Tente novamente.";
  }
}

async function validateFinalCredentials() {
  const userInput = document.getElementById("final-user");
  const passwordInput = document.getElementById("final-password");
  const message = document.getElementById("msg-3");

  const userValue = userInput.value.trim();
  const passwordValue = passwordInput.value.trim();

  if (!userValue || !passwordValue) {
    message.textContent = "Digite o usuário e a senha antes de enviar.";
    return;
  }

  const expectedUserHash = STEP_HASHES.finalUser;
  const expectedPasswordHash = STEP_HASHES.finalPassword;

  if (
    !expectedUserHash || expectedUserHash.startsWith("COLE_AQUI") ||
    !expectedPasswordHash || expectedPasswordHash.startsWith("COLE_AQUI")
  ) {
    message.textContent = "Os hashes finais ainda não foram configurados.";
    return;
  }

  const receivedUserHash = await sha256(userValue);
  const receivedPasswordHash = await sha256(passwordValue);

  if (receivedUserHash === expectedUserHash && receivedPasswordHash === expectedPasswordHash) {
    message.textContent = "Acesso final validado com sucesso!";
    showScreen(5);
  } else {
    message.textContent = "Usuário ou senha incorretos.";
  }
}

function resetProgress() {
  localStorage.removeItem(STORAGE_KEY);
  [
    "input-1",
    "input-2",
    "final-user",
    "final-password"
  ].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });

    ["msg-1", "msg-2", "msg-3"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.textContent = "";
    });

      showScreen(1);
}

document.querySelectorAll(".back-button").forEach((button) => {
  button.addEventListener("click", () => {
    const previousScreen = Number(button.dataset.back);
    showScreen(previousScreen);
  });
});

document.getElementById("startButton").addEventListener("click", () => {
  showScreen(2);
});

document.getElementById("send-1").addEventListener("click", () => {
  validateFlagStep(1, "flag1", "input-1", "msg-1", 3);
});

document.getElementById("send-2").addEventListener("click", () => {
  validateFlagStep(2, "flag2", "input-2", "msg-2", 4);
});

document.getElementById("send-final").addEventListener("click", validateFinalCredentials);
document.getElementById("resetButton").addEventListener("click", resetProgress);

document.getElementById("input-1").addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    validateFlagStep(1, "flag1", "input-1", "msg-1", 3);
  }
});

document.getElementById("input-2").addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    validateFlagStep(2, "flag2", "input-2", "msg-2", 4);
  }
});

document.getElementById("final-user").addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    validateFinalCredentials();
  }
});

document.getElementById("final-password").addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    validateFinalCredentials();
  }
});

showScreen(getSavedScreen());

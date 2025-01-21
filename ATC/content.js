//////////////////////////////// **** ALERT CONTAINER **** ////////////////////////////////

let submittype;

function ensureAlertContainer() {
  var alertContainer = document.getElementById("alert-container");
  if (!alertContainer) {
    alertContainer = document.createElement("div");
    alertContainer.id = "alert-container";
    alertContainer.style.position = "fixed";
    alertContainer.style.top = "50%";
    alertContainer.style.right = "10px";
    alertContainer.style.transform = "translateY(-50%)";
    alertContainer.style.backgroundColor = "#FF0000";
    alertContainer.style.border = "1px solid #FF0000";
    alertContainer.style.padding = "20px";
    alertContainer.style.borderRadius = "10px";
    alertContainer.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";
    alertContainer.style.zIndex = "1000";
    alertContainer.style.display = "flex";
    alertContainer.style.flexDirection = "column";
    alertContainer.style.alignItems = "flex-start";
    alertContainer.style.cursor = "move";

    var logo = document.createElement("img");
    logo.src =
      "https://www.interpublic.com/wp-content/uploads/2019/04/Logo_UM-e1566481266432.png";
    logo.alt = "Logo";
    logo.id = "alert-logo";
    logo.style.width = "50px";
    logo.style.height = "50px";
    logo.style.marginBottom = "10px";
    alertContainer.appendChild(logo);

    document.body.appendChild(alertContainer);

    makeDraggable(alertContainer);
  }
  return alertContainer;
}

function removeAlertContainerIfEmpty() {
  var alertContainer = document.getElementById("alert-container");
  if (alertContainer && alertContainer.childElementCount <= 1) {
    alertContainer.remove();
  }
}

function addAlert(id, message) {
  var alertContainer = ensureAlertContainer();
  var alert = document.getElementById(id);
  if (!alert) {
    alert = document.createElement("p");
    alert.id = id;
    alert.innerHTML = message;
    alert.style.margin = "0 0 10px 0";
    alert.style.padding = "10px";
    alert.style.backgroundColor = "#f8f9fa";
    alert.style.border = "1px solid #ff0000";
    alert.style.borderRadius = "5px";
    alert.style.fontSize = "14px";

    if (id.startsWith("alertuser")) {
      alertContainer.insertBefore(alert, alertContainer.firstChild.nextSibling);
    } else {
      alertContainer.appendChild(alert);
    }
  }
}

function removeAlert(id) {
  var alert = document.getElementById(id);
  if (alert) {
    alert.remove();
    removeAlertContainerIfEmpty();
  }
}

function makeDraggable(element) {
  let isDragging = false;
  let startX, startY, initialX, initialY;

  element.addEventListener("mousedown", (e) => {
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    initialX = element.offsetLeft;
    initialY = element.offsetTop;

    // Remove right style and set left style
    element.style.left = element.getBoundingClientRect().right + "px";
    element.style.right = "";

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  });

  function onMouseMove(e) {
    if (isDragging) {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      element.style.left = initialX + deltaX + "px";
      element.style.top = initialY + deltaY + "px";
      element.style.transform = ""; // Disable transform during dragging
    }
  }

  function onMouseUp() {
    isDragging = false;
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  }
}

////////////////////////////////////// **** POPUP JS **** //////////////////////////////////////

document.addEventListener("DOMContentLoaded", function () {
  let accounts = [];
  let campaigns = [];
  let isLoggedIn = false;
  const input = document.getElementById("accountInput");
  const datalist = document.getElementById("accountsDatalist");
  const campaignInput = document.getElementById("campaignInput");
  const campaignDatalist = document.getElementById("campaignsDatalist");
  const loginForm = document.getElementById("loginForm");
  const loginButton = document.getElementById("loginButton");
  const selectionForm = document.getElementById("selectionForm");
  const selectAccountButton = document.getElementById("selectAccountButton");
  const selectCampaignButton = document.getElementById("selectCampaignButton");
  const accountForm = document.getElementById("accountForm");
  const accountSubmitButton = document.getElementById("accountSubmitButton");
  const campaignForm = document.getElementById("campaignForm");
  const campaignSubmitButton = document.getElementById("campaignSubmitButton");
  const errorMessage = document.getElementById("errorMessage");
  const logoutButton = document.getElementById("accountlogout");
  const campaignLogoutButton = document.getElementById("campaignlogout");
  const backButton = document.getElementById("backButton");
  const accountSubmittedMessage = document.getElementById(
    "accountSubmittedMessage"
  );

  function updateDatalist() {
    datalist.innerHTML = "";
    accounts.forEach((account) => {
      const option = document.createElement("option");
      option.value = account;
      datalist.appendChild(option);
    });
  }

  function updateCampaignDatalist() {
    campaignDatalist.innerHTML = "";
    campaigns.forEach((campaign) => {
      const option = document.createElement("option");
      option.value = campaign;
      campaignDatalist.appendChild(option);
    });
  }

  function loadStorageData() {
    chrome.storage.local.get(["rules"], function (data) {
      const submittedAccountName =
        data.rules && data.rules.length > 0 ? data.rules[0].accountName : "";

      if (submittedAccountName) {
        accountSubmittedMessage.textContent =
          "Account Submitted: " + submittedAccountName;
        accountSubmittedMessage.style.display = "block";
      } else {
        accountSubmittedMessage.style.display = "none;";
      }
    });

    chrome.storage.local.get(
      [
        "isLoggedIn",
        "accounts",
        "campaigns",
        "currentForm",
        "accountInput",
        "campaignInput",
      ],
      function (data) {
        if (data.isLoggedIn) {
          isLoggedIn = data.isLoggedIn;
          accounts = data.accounts || [];
          campaigns = data.campaigns || [];
          input.value = data.accountInput || ""; // Restore account input value
          campaignInput.value = data.campaignInput || ""; // Restore campaign input value
          updateDatalist();
          updateCampaignDatalist();
          displayForm(data.currentForm || "loginForm"); // Display the last open form
        } else {
          accountSubmittedMessage.style.display = "none";
        }
      }
    );
  }

  function saveCurrentState(currentForm) {
    chrome.storage.local.set({
      currentForm: currentForm,
      accountInput: input.value,
      campaignInput: campaignInput.value,
      rules: chrome.storage.local.get(["rules"], function (data) {
        return data.rules;
      }),
    });
  }

  function displayForm(formId) {
    const allForms = [loginForm, selectionForm, accountForm, campaignForm];
    allForms.forEach((form) => (form.style.display = "none"));
    document.getElementById(formId).style.display = "block";
    backButton.style.display = formId === "loginForm" ? "none" : "block";
    saveCurrentState(formId); // Current form state saved here
  }

  function resetState() {
    accounts = [];
    isLoggedIn = false;
    chrome.storage.local.set(
      {
        accounts: [],
        isLoggedIn: false,
        rules: [],
        accountInput: "",
        campaignInput: "",
      },
      function () {
        console.log("State has been reset.");
      }
    );
    loginForm.style.display = "block";
    selectionForm.style.display = "none";
    accountForm.style.display = "none";
    campaignForm.style.display = "none";
    backButton.style.display = "none";
    document.getElementById("mail").value = "";
    document.getElementById("password").value = "";
    errorMessage.innerText = "";
    accountSubmittedMessage.style.display = "none";
  }

  input.addEventListener("input", function () {
    const value = this.value.toLowerCase();
    const suggestions = accounts.filter((account) =>
      account.toLowerCase().startsWith(value)
    );
    datalist.innerHTML = "";
    suggestions.forEach((account) => {
      const option = document.createElement("option");
      option.value = account;
      datalist.appendChild(option);
    });
  });

  campaignInput.addEventListener("input", function () {
    const value = this.value.toLowerCase();
    const suggestions = campaigns.filter((campaign) =>
      campaign.toLowerCase().startsWith(value)
    );
    campaignDatalist.innerHTML = "";
    suggestions.forEach((campaign) => {
      const option = document.createElement("option");
      option.value = campaign;
      campaignDatalist.appendChild(option);
    });
  });

  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();
    loginButton.classList.add("loading");
    errorMessage.textContent = "";

    const mail = document.getElementById("mail").value;
    const password = document.getElementById("password").value;

    fetch("https://act-api.vercel.app/user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ mail: mail, password: password }),
    })
      .then((response) => {
        if (!response.ok) {
          //throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        loginButton.classList.remove("loading");
        if (data.hata) {
          errorMessage.textContent = data.hata;
          errorMessage.style.color = "red";
        } else {
          isLoggedIn = true;
          console.log(data);
          chrome.storage.local.set({ isLoggedIn: true }, function () {
            console.log("Login status saved to chrome storage.");
          });
          loginForm.style.display = "none";
          selectionForm.style.display = "block";
          backButton.style.display = "none";
          accounts =
            data.user && data.user.account
              ? data.user.account.map((acc) => acc.name)
              : [];
          chrome.storage.local.set({ accounts: accounts }, function () {
            console.log("Accounts data saved to chrome storage.");
          });
          updateDatalist();
          updateCampaignDatalist();
        }
      })
      .catch((error) => {
        console.error("Fetch error:", error);
        errorMessage.textContent = error.message;
        errorMessage.style.color = "red";
        loginButton.classList.remove("loading");
      });
  });

  selectAccountButton.addEventListener("click", function () {
    selectionForm.style.display = "none";
    accountForm.style.display = "block";
    backButton.style.display = "block"; // Show back button when form is displayed
    saveCurrentState("accountForm"); // Save state when switching to account form
  });

  selectCampaignButton.addEventListener("click", function () {
    selectionForm.style.display = "none";
    campaignForm.style.display = "block";
    backButton.style.display = "block"; // Show back button when form is displayed
    saveCurrentState("campaignForm"); // Save state when switching to campaign form
  });

  backButton.addEventListener("click", function () {
    if (accountForm.style.display === "block") {
      accountForm.style.display = "none";
      selectionForm.style.display = "block";
      saveCurrentState("selectionForm"); // Save state when back button is clicked
    } else if (campaignForm.style.display === "block") {
      campaignForm.style.display = "none";
      selectionForm.style.display = "block";
      saveCurrentState("selectionForm"); // Save state when back button is clicked
    }
    backButton.style.display = "none";
  });

  window.addEventListener("beforeunload", function () {
    const currentForm = document.querySelector(
      'form[style*="display: block"]'
    ).id;
    saveCurrentState(currentForm); // Save current form state before unloading
  });

  accountSubmitButton.addEventListener("click", function (event) {
    event.preventDefault();
    const accountName = input.value;
    submittype = "account";
    console.log("Submitting Account:", accountName); // Check the input value

    fetch("https://act-api.vercel.app/findAccountRules", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ accountName: accountName }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (data.rules) {
          console.log("Rules:", data.rules);
          chrome.storage.local.set({ rules: data.rules }, function () {
            console.log("Rules data saved to chrome storage.");
            // Update accountSubmittedMessage and save current state
            accountSubmittedMessage.textContent =
              "Account Submitted: " + accountName;
            accountSubmittedMessage.style.display = "block";
            saveCurrentState("accountForm"); // Save state after submitting the account
          });
        } else {
          console.error("No rules found for this account");
        }
      })
      .catch((error) => {
        console.error("Fetch error when submitting account:", error);
        errorMessage.textContent =
          "There was an error processing your request: " + error.message;
        errorMessage.style.color = "red";
      });
  });

  campaignSubmitButton.addEventListener("click", function (event) {
    event.preventDefault();
    const campaignName = campaignInput.value;
    submittype = "campaign";
    console.log("Submitting Campaign:", campaignName);

    fetch("https://act-api.vercel.app/findcampaignrules", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ campaignName: campaignName }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (data) {
          console.log("Rules:", data);
          chrome.storage.local.set({ rules: data }, function () {
            console.log("Rules data saved to chrome storage.");
            // Update campaignSubmittedMessage and save current state
            campaignSubmittedMessage.textContent =
              "Campaign Submitted: " + campaignName;
            campaignSubmittedMessage.style.display = "block";
            saveCurrentState("campaignForm");
          });
        } else {
          console.error("No rules found for this campaign");
        }
      })
      .catch((error) => {
        console.error("Fetch error when submitting campaign:", error);
        errorMessage.textContent =
          "There was an error processing your request: " + error.message;
        errorMessage.style.color = "red";
      });
  });

  logoutButton.addEventListener("click", function () {
    resetState();
  });

  loadStorageData(); // Load data on page load
});

let budgetCampaign = false;
let budgetAdSet = false;
let bExceed = false;

////////////////////////////////////// FACEBOOK HANDLERS //////////////////////////////////////

var callback = function (mutationsList, observer) {
  for (var mutation of mutationsList) {
    chrome.storage.local.get("rules", function (data) {
      if (data.rules) {
        // var budgetInputs = document.querySelectorAll('input[value^="TL"]');
        const budgetRule = data.rules.find(
          (r) => r.ruleDescription === "Budget"
        );
        if (budgetRule) {
          var inputs = document.querySelectorAll(
            'input[placeholder="Please enter an amount"]'
          );
          var inputs2 = document.querySelectorAll(
            'input[placeholder="Please enter amount"]'
          );
          budgetCampaign = true;
          if (inputs.length > 0) {
            budgetCampaign = true;
            inputs.forEach(function (input) {
              var value = parseFloat(
                input.value.replace("TL", "").replace(",", "")
              );
              if (!isNaN(value) && value > budgetRule.rule) {
                bExceed = true;
                addAlert("alert5", "Bütçe aşıldı!");
              }
              if (value < budgetRule.rule) {
                bExceed = false;
                removeAlert("alert5");
              }
            });
          }
          // else {
          //     budgetCampaign = false;
          //     removeAlert('alert5');
          // }
          if (bExceed) {
            // İçeriği "Publish" olan div'i bul
            var publishDiv = Array.from(document.querySelectorAll("div")).find(
              (div) => div.textContent.trim() === "Publish"
            );

            if (publishDiv) {
              publishDiv.disabled = true;

              // Div'e tooltip için gerekli CSS özelliklerini ekle
              publishDiv.style.position = "relative"; // Tooltip için referans noktası
              publishDiv.style.cursor = "not-allowed"; // Kullanıcıya görsel olarak pasiflik belirt
              publishDiv.style.opacity = "0.9"; // Görsel olarak pasif görünmesi için opaklık ayarla
              publishDiv.style.backgroundColor = "red";

              // Tooltip elemanını oluştur
              var tooltip = document.createElement("span");
              tooltip.textContent =
                "Bütçe aşıldığı için kampanya Publish edilemez."; // Tooltip mesajı
              tooltip.style.position = "absolute";
              tooltip.style.width = "420px";
              tooltip.style.backgroundColor = "black";
              tooltip.style.color = "white";
              tooltip.style.padding = "5px";
              tooltip.style.borderRadius = "5px";
              tooltip.style.fontSize = "12px";
              tooltip.style.visibility = "hidden"; // Başlangıçta gizli
              tooltip.style.whiteSpace = "nowrap"; // Tek satırda göster
              tooltip.style.bottom = "125%"; // Div'in üstüne konumlandır
              tooltip.style.left = "50%";
              tooltip.style.transform = "translateX(-50%)"; // Ortalamak için
              tooltip.style.zIndex = "1000";

              // Tooltip'i div'in içine ekle
              publishDiv.appendChild(tooltip);

              // Hover olaylarını ekle
              publishDiv.addEventListener("mouseenter", () => {
                tooltip.style.visibility = "visible";
              });

              publishDiv.addEventListener("mouseleave", () => {
                tooltip.style.visibility = "hidden";
              });
            }
          }
        }

        const budgetRuleAdSetBudget = data.rules.find(
          (r) => r.ruleDescription === "Ad Set Budget"
        );
        if (budgetRuleAdSetBudget) {
          if (budgetCampaign === false) {
            var dollarInputs = document.querySelectorAll('input[value^="TL"]');
            var exceededValue = false;
            if (dollarInputs.length > 0) {
              budgetAdSet = true;
              dollarInputs.forEach(function (input) {
                var value = parseFloat(
                  input.value.replace("TL", "").replace(",", "")
                );
                if (!isNaN(value) && value > budgetRuleAdSetBudget.rule) {
                  exceededValue = true;
                  addAlert("alert6", "Ad set bütçesi aşıldı!");
                } else {
                  removeAlert("alert6");
                }
              });
            } else {
              budgetAdSet = false;
            }
          } else {
            removeAlert("alert6");
          }
        }
        const budgetRuleAB = data.rules.find(
          (r) => r.ruleDescription === "A/B Testing"
        );
        if (budgetRuleAB) {
          var element2 = document.querySelector(
            '[aria-label="Create A/B test"]'
          );

          if (budgetRuleAB.rule === "Yes") {
            if (element2.getAttribute("aria-checked") === "false") {
              addAlert("alert1", "A/B test kuralı hatalı!");
            } else {
              removeAlert("alert1");
            }
          } else {
            if (element2.getAttribute("aria-checked") === "true") {
              addAlert("alert1", "A/B test kuralı hatalı!");
            } else {
              removeAlert("alert1");
            }
          }
        }
        const budgetRuleType = data.rules.find(
          (r) => r.ruleDescription === "Budget Type"
        );
        if (budgetRuleType) {
          if (budgetRuleType.rule === "Lifetime Budget") {
            var spans = document.querySelectorAll("span");

            var foundDailyBudget = false;
            spans.forEach(function (span) {
              var expectedStyle =
                "font-family: Roboto, Arial, sans-serif; font-size: 0.875rem; line-height: 1.42857; letter-spacing: normal; overflow-wrap: normal; text-align: left; color: rgba(0, 0, 0, 0.85);";

              if (span.getAttribute("style") === expectedStyle) {
                if (span.textContent.includes("Daily budget")) {
                  foundDailyBudget = true;
                  addAlert("alert4", "Budget type lifetime olmalı!");
                }
                if (span.textContent.includes("Lifetime budget")) {
                  removeAlert("alert4");
                }
              }
            });
            // if (!foundDailyBudget) {
            //     removeAlert('alert4');
            // }
          } else {
            var spans = document.querySelectorAll("span");
            var foundDailyBudget = false;
            spans.forEach(function (span) {
              var expectedStyle =
                "font-family: Roboto, Arial, sans-serif; font-size: 0.875rem; line-height: 1.42857; letter-spacing: normal; overflow-wrap: normal; text-align: left; color: rgba(0, 0, 0, 0.85);";

              if (span.getAttribute("style") === expectedStyle) {
                if (span.textContent.includes("Lifetime budget")) {
                  foundDailyBudget = true;
                  addAlert("alert4", "Budget type daily olmalı!");
                }
                if (span.textContent.includes("Daily budget")) {
                  removeAlert("alert4");
                }
                // else {
                //     removeAlert('alert4');
                // }
              }
            });
            // if (!foundDailyBudget) {
            //     removeAlert('alert4');
            // }
          }
        }

        const Taxonomy = data.rules.find(
          (r) => r.ruleDescription === "Taxonomy"
        );
        if (Taxonomy) {
          if (
            Taxonomy.rule ===
            "BrandName|Platform|CampaignName|Objective|StartDate|EndDate"
          ) {
            let inputElement1 = document.querySelector(
              'input[placeholder="Enter your campaign name here..."]'
            );

            const regex =
              /^[A-Za-z0-9]+(?:\|[A-Za-z0-9]+){3}\|\d{4}-\d{2}-\d{2}\|\d{4}-\d{2}-\d{2}$/;
            if (!regex.test(inputElement1.value.toLowerCase())) {
              addAlert("alert1544", "Taxonomy yapısı hatalı!");
            } else {
              removeAlert("alert1544");
            }
          }
          if (
            Taxonomy.rule ===
            "BrandName_Platform_CampaignName_Objective_StartDate_EndDate"
          ) {
            let inputElement1 = document.querySelector(
              'input[placeholder="Enter your campaign name here..."]'
            );
            const regex =
              /^[A-Za-z0-9]+_[A-Za-z0-9]+_[A-Za-z0-9]+_[A-Za-z0-9]+_\d{4}-\d{2}-\d{2}_\d{4}-\d{2}-\d{2}$/;
            if (!regex.test(inputElement1.value.toLowerCase())) {
              addAlert("alert1544", "Taxonomy yapısı hatalı!");
            } else {
              removeAlert("alert1544");
            }
          }
          if (
            Taxonomy.rule ===
            "BrandName-Platform-CampaignName-Objective-StartDate-EndDate"
          ) {
            let inputElement1 = document.querySelector(
              'input[placeholder="Enter your campaign name here..."]'
            );
            const regex =
              /^[A-Za-z0-9]+(?:-[A-Za-z0-9]+){3}-\d{4}-\d{2}-\d{2}-\d{4}-\d{2}-\d{2}$/;
            if (!regex.test(inputElement1.value.toLowerCase())) {
              addAlert("alert1544", "Taxonomy yapısı hatalı!");
            } else {
              removeAlert("alert1544");
            }
          }
        }
        if (data.rules[0].campaignName !== undefined) {
          let a = data.rules[0].campaignName;
          let inputElement3 = document.querySelector(
            'input[placeholder="Enter your campaign name here..."]'
          );
          if (inputElement3) {
            inputElement3.addEventListener("input", function () {
              if (inputElement3.value !== a) {
                addAlert("alert122", "Campaign name  hatalı olarak girildi!");
              } else {
                removeAlert("alert122");
              }
            });
          }
        }
      }
    });

    var allSpans = document.querySelectorAll("span");
    allSpans.forEach(function (span, index) {
      var spanText = span.textContent;
      var expectedStyle =
        "font-family: Roboto, Arial, sans-serif; font-size: 0.875rem; line-height: 1.42857; letter-spacing: normal; overflow-wrap: normal; text-align: left; color: rgba(0, 0, 0, 0.85);";

      if (
        span.getAttribute("style") === expectedStyle &&
        /\(\d+\)/.test(spanText)
      ) {
        addAlert("alert-span-" + index, spanText + "<br>olarak giriş yapıldı");
      } else {
        removeAlert("alert-span-" + index);
      }
    });
  }
};

////////////////////////////////////// GOOGLE HANDLERS //////////////////////////////////////

function setupHandlers() {
  chrome.storage.local.get("rules", function (data) {
    if (data && data.rules) {
      const rules = {};
      data.rules.forEach((rule) => {
        rules[rule.ruleDescription] = rule.rule;
      });

      const observer = new MutationObserver(() => {
        attachInputHandlers(rules);
        if (data.rules[0].campaignName) {
          checkCampaignNameMatch(rules, data.rules[0].campaignName);
        }
      });

      observer.observe(document.body, {
        attributes: true,
        childList: true,
        subtree: true,
      });

      attachInputHandlers(rules);
      if (data.rules[0].campaignName) {
        checkCampaignNameMatch(rules, data.rules[0].campaignName);
      }
    }
  });
}
function checkCampaignNameMatch(rules, cname) {
  const adcamInput = document.querySelector('input[aria-label="Kampanya adı"]');

  if (adcamInput) {
    // Element kontrolü yapılıyor.
    console.log(adcamInput.value);

    // Burada doğrudan storage'dan okuma yerine, zaten yüklenmiş olan `rules` objesini kullanın.
    // const campaignName = rules.find(rule => rule.campaignName)?.campaignName;

    // addAlert("alert108", "Reklam grubu adı ve kampanya adı eşleşiyor.");

    if (adcamInput.value !== cname) {
      addAlert("alert108", "Kampanya adı doğru girilmedi!");
    } else {
      removeAlert("alert108");
    }
  } else {
    console.error("Kampanya adı için input bulunamadı.");
  }
}
let googleBExceed = false;

function attachInputHandlers(rules) {
  if (googleBExceed) {
    var publishDiv = Array.from(document.querySelectorAll("span")).find(
      (div) => div.textContent.trim() === "Kampanyayı yayınla"
    );

    if (publishDiv) {
      publishDiv.disabled = true;

      // Div'e tooltip için gerekli CSS özelliklerini ekle
      publishDiv.style.position = "relative"; // Tooltip için referans noktası
      publishDiv.style.cursor = "not-allowed"; // Kullanıcıya görsel olarak pasiflik belirt
      publishDiv.style.opacity = "0.9"; // Görsel olarak pasif görünmesi için opaklık ayarla
      publishDiv.style.backgroundColor = "red";
      publishDiv.style.color = "white";

      // Tooltip elemanını oluştur
      var tooltip = document.createElement("span");
      tooltip.textContent = "Bütçe aşıldığı için kampanya Publish edilemez."; // Tooltip mesajı
      tooltip.style.position = "absolute";
      tooltip.style.width = "420px";
      tooltip.style.backgroundColor = "black";
      tooltip.style.color = "white";
      tooltip.style.padding = "5px";
      tooltip.style.borderRadius = "5px";
      tooltip.style.fontSize = "12px";
      tooltip.style.visibility = "hidden"; // Başlangıçta gizli
      tooltip.style.whiteSpace = "nowrap"; // Tek satırda göster
      tooltip.style.bottom = "125%"; // Div'in üstüne konumlandır
      tooltip.style.left = "50%";
      tooltip.style.transform = "translateX(-50%)"; // Ortalamak için
      tooltip.style.zIndex = "1000";

      // Tooltip'i div'in içine ekle
      publishDiv.appendChild(tooltip);

      // Hover olaylarını ekle
      publishDiv.addEventListener("mouseenter", () => {
        tooltip.style.visibility = "visible";
      });

      publishDiv.addEventListener("mouseleave", () => {
        tooltip.style.visibility = "hidden";
      });
    }
  }

  const adcamInput = document.querySelector(
    'input[aria-label="Reklam grubu adı"]'
  );
  if (adcamInput && !adcamInput.dataset.listenerAdded) {
    adcamInput.addEventListener("input", (event) =>
      handleAdGroupName(event, rules["Taxonomy"])
    );
    adcamInput.dataset.listenerAdded = "true";
  }

  const budgetInput = document.querySelector(
    'input[aria-label="Bütçe tutarı (₺ cinsinden)"]'
  );
  if (budgetInput && !budgetInput.dataset.listenerAdded) {
    budgetInput.addEventListener("input", (event) =>
      handleBudgetInputChange(event, parseFloat(rules["Budget"]))
    );
    budgetInput.dataset.listenerAdded = "true";
  }

  const campaignInput = document.querySelector(
    'input[aria-label="Kampanya adı"]'
  );
  if (campaignInput && !campaignInput.dataset.listenerAdded) {
    campaignInput.addEventListener("input", (event) =>
      handleCampaignInputChange(event, rules["Taxonomy"])
    );
    campaignInput.dataset.listenerAdded = "true";
  }

  const targetCPMBidInput = document.querySelector(
    'input[aria-label="Hedef GBM teklifi (₺ cinsinden)"]'
  );
  if (targetCPMBidInput && !targetCPMBidInput.dataset.listenerAdded) {
    targetCPMBidInput.addEventListener("input", (event) =>
      handleTargetCPMBidInputChange(
        event,
        parseFloat(rules["Target GBM budget"])
      )
    );
    targetCPMBidInput.dataset.listenerAdded = "true";
  }

  const keywordTextarea = document.querySelectorAll(
    'textarea[aria-label*="Anahtar kelimeler"]'
  );
  keywordTextarea.forEach((textarea) => {
    if (!textarea.dataset.listenerAdded) {
      textarea.addEventListener("input", (event) =>
        handleKeywordTextareaChange(event, rules["Keywords"])
      );
      textarea.dataset.listenerAdded = "true";
    }
  });

  const avgDailyBudgetInput = document.querySelector(
    'input[aria-label="Bu kampanya için ortalama günlük bütçenizi belirleyin"]'
  );
  if (avgDailyBudgetInput && !avgDailyBudgetInput.dataset.listenerAdded) {
    avgDailyBudgetInput.addEventListener("input", (event) =>
      handleBudgetInputChange(event, parseFloat(rules["Budget"]))
    );
    avgDailyBudgetInput.dataset.listenerAdded = "true";
  }

  checkDivContent(rules);
  checkShoppingCartItems(rules);
}

function handleBudgetInputChange(event, Budget) {
  const value = parseFloat(event.target.value);
  if (!isNaN(value) && value > Budget) {
    addAlert("alert7", `Bütçe tutarı ${Budget}₺ üzerinde.`);
    googleBExceed = true;

    if (googleBExceed) {
      // İçeriği "Publish" olan div'i bul
      var publishDiv = Array.from(document.querySelectorAll("span")).find(
        (div) => div.textContent.trim() === "Kampanyayı yayınla"
      );

      if (publishDiv) {
        publishDiv.disabled = true;

        // Div'e tooltip için gerekli CSS özelliklerini ekle
        publishDiv.style.position = "relative"; // Tooltip için referans noktası
        publishDiv.style.cursor = "not-allowed"; // Kullanıcıya görsel olarak pasiflik belirt
        publishDiv.style.opacity = "0.9"; // Görsel olarak pasif görünmesi için opaklık ayarla
        publishDiv.style.backgroundColor = "red";

        // Tooltip elemanını oluştur
        var tooltip = document.createElement("span");
        tooltip.textContent = "Bütçe aşıldığı için kampanya Publish edilemez."; // Tooltip mesajı
        tooltip.style.position = "absolute";
        tooltip.style.width = "420px";
        tooltip.style.backgroundColor = "black";
        tooltip.style.color = "white";
        tooltip.style.padding = "5px";
        tooltip.style.borderRadius = "5px";
        tooltip.style.fontSize = "12px";
        tooltip.style.visibility = "hidden"; // Başlangıçta gizli
        tooltip.style.whiteSpace = "nowrap"; // Tek satırda göster
        tooltip.style.bottom = "125%"; // Div'in üstüne konumlandır
        tooltip.style.left = "50%";
        tooltip.style.transform = "translateX(-50%)"; // Ortalamak için
        tooltip.style.zIndex = "1000";

        // Tooltip'i div'in içine ekle
        publishDiv.appendChild(tooltip);

        // Hover olaylarını ekle
        publishDiv.addEventListener("mouseenter", () => {
          tooltip.style.visibility = "visible";
        });

        publishDiv.addEventListener("mouseleave", () => {
          tooltip.style.visibility = "hidden";
        });
      }
    }
  } else {
    removeAlert("alert7");
    googleBExceed = false;
  }
}

function handleCampaignInputChange(event, Taxonomy) {
  const value = event.target.value.toLowerCase();
  if (
    Taxonomy === "BrandName|Platform|CampaignName|Objective|StartDate|EndDate"
  ) {
    const regex =
      /^[A-Za-z0-9]+(?:\|[A-Za-z0-9]+){3}\|\d{4}-\d{2}-\d{2}\|\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(value.toLowerCase())) {
      addAlert("alert15", "Kampanya adı için taxonomy yapısı hatalı!");
    } else {
      removeAlert("alert15");
    }
  }
  if (
    Taxonomy === "BrandName_Platform_CampaignName_Objective_StartDate_EndDate"
  ) {
    const regex =
      /^[A-Za-z0-9]+_[A-Za-z0-9]+_[A-Za-z0-9]+_[A-Za-z0-9]+_\d{4}-\d{2}-\d{2}_\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(value.toLowerCase())) {
      addAlert("alert15", "Kampanya adı için taxonomy yapısı hatalı!");
    } else {
      removeAlert("alert15");
    }
  }
  if (
    Taxonomy === "BrandName-Platform-CampaignName-Objective-StartDate-EndDate"
  ) {
    const regex =
      /^[A-Za-z0-9]+(?:-[A-Za-z0-9]+){3}-\d{4}-\d{2}-\d{2}-\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(value.toLowerCase())) {
      addAlert("alert15", "Kampanya adı için taxonomy yapısı hatalı!");
    } else {
      removeAlert("alert15");
    }
  }
}

function handleAdGroupName(event, Taxonomy) {
  const value = event.target.value.toLowerCase();
  if (
    Taxonomy === "BrandName|Platform|CampaignName|Objective|StartDate|EndDate"
  ) {
    const regex =
      /^[A-Za-z0-9]+(?:\|[A-Za-z0-9]+){3}\|\d{4}-\d{2}-\d{2}\|\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(value.toLowerCase())) {
      addAlert("alert95", "Reklam grubu adı için taxonomy yapısı hatalı!");
    } else {
      removeAlert("alert95");
    }
  }
  if (
    Taxonomy === "BrandName_Platform_CampaignName_Objective_StartDate_EndDate"
  ) {
    const regex =
      /^[A-Za-z0-9]+_[A-Za-z0-9]+_[A-Za-z0-9]+_[A-Za-z0-9]+_\d{4}-\d{2}-\d{2}_\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(value.toLowerCase())) {
      addAlert("alert95", "Reklam grubu adı için taxonomy yapısı hatalı!");
    } else {
      removeAlert("alert95");
    }
  }
  if (
    Taxonomy === "BrandName-Platform-CampaignName-Objective-StartDate-EndDate"
  ) {
    const regex =
      /^[A-Za-z0-9]+(?:-[A-Za-z0-9]+){3}-\d{4}-\d{2}-\d{2}-\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(value.toLowerCase())) {
      addAlert("alert95", "Reklam grubu adı için taxonomy yapısı hatalı!");
    } else {
      removeAlert("alert95");
    }
  }
}

function handleTargetCPMBidInputChange(event, rule) {
  const value = parseFloat(event.target.value);
  if (!isNaN(value) && value > rule) {
    addAlert("alert9", `Hedef GBM teklifi ${rule}₺ üzerinde.`);
  } else {
    removeAlert("alert9");
  }
}

function handleKeywordTextareaChange(event, keyword) {
  const value = event.target.value.toLowerCase();
  if (value.includes(keyword.toLowerCase())) {
    addAlert("alert10", `Anahtar kelimeler arasında "${keyword}" bulundu.`);
  } else {
    removeAlert("alert10");
  }
}

function checkDivContent(rules) {}
function checkShoppingCartItems(rules) {}
setupHandlers();

////////////////////////////////////// LINKEDIN HANDLERS //////////////////////////////////////

let linkedinBExceed = false;
function setupLinkedInHandlers() {
  chrome.storage.local.get("rules", function (data) {
    if (data && data.rules) {
      const rules = {};
      data.rules.forEach((rule) => {
        rules[rule.ruleDescription] = rule.rule;
      });

      const Budget = parseFloat(rules["Budget"]);
      const BudgetType = rules["Budget Type"];
      const Taxonomy = rules["Taxonomy"];
      const Currency = rules["Currency"];
      if (Budget || BudgetType || Taxonomy) {
        const observer = new MutationObserver(() => {
          attachLinkedInInputHandlers(Budget, BudgetType, Taxonomy);
        });
        observer.observe(document.body, {
          attributes: true,
          childList: true,
          subtree: true,
        });
        // attachLinkedInInputHandlers(Budget, BudgetType, Taxonomy);
      }
    }
  });
}

function attachLinkedInInputHandlers(Budget, BudgetType, Taxonomy) {
  checkCampaignLifetimeBudgetInput(Budget, BudgetType);
  checkCampaignBudgetType(BudgetType);
  checkCampaignName(Taxonomy);
}

function checkCampaignLifetimeBudgetLabel(Currency) {
  const labels = document.querySelectorAll(
    'label[for="campaign-lifetime-budget"]'
  );

  labels.forEach(function (label) {
    if (label && !label.textContent.includes(Currency)) {
      addAlert("alert13", "Currency seçimi hatalı!");
      console.log("Currency:", Currency);
    } else {
      removeAlert("alert13");
    }
  });
}

function checkCampaignLifetimeBudgetInput(Budget, BudgetType) {
  if (BudgetType === "Lifetime Budget") {
    const input = document.querySelector(
      'input[id="bid-and-budget__total-budget"]'
    );
    if (input) {
      let cleanedInput = input.value.replace(/[^\d]/g, "");
      cleanedInput = cleanedInput.replace(/00$/, "");
      const value = parseInt(cleanedInput, 10);
      if (!isNaN(value) && value > Budget) {
        addAlert("alert14", "Bütçe aşıldı. ");
        linkedinBExceed = true;
      } else {
        removeAlert("alert14");
        linkedinBExceed = false;
      }
    } else {
      removeAlert("alert14");
      linkedinBExceed = false;
    }
  } else {
    const input2 = document.querySelector(
      'input[id="bid-and-budget__daily-budget"]'
    );

    if (input2) {
      let cleanedInput = input2.value.replace(/[^\d]/g, "");
      cleanedInput = cleanedInput.replace(/00$/, "");
      const value = parseInt(cleanedInput, 10);
      if (!isNaN(value) && value > Budget) {
        addAlert("alert142", "Bütçe aşıldı. günlük ");
        linkedinBExceed = true;
      } else {
        removeAlert("alert142");
        linkedinBExceed = false;
      }
    } else {
      removeAlert("alert142");
      linkedinBExceed = false;
    }
  }

  lBExceed2();
}

function checkCampaignBudgetType(BudgetType) {
  const selectElement = document.querySelector('select[title="Bütçe"]');
  const selectedText = selectElement.options[selectElement.selectedIndex].text;
  if (selectElement) {
    if (BudgetType === "Lifetime Budget") {
      if (selectedText !== "Kampanya bütçesi ayarlayın") {
        addAlert("LinkedinBType", "Bütçe türü kampanya bütçesi olmalı.");
      } else {
        removeAlert("LinkedinBType");
      }
    }
    if (BudgetType === "Daily Budget") {
      if (selectedText !== "Günlük bütçe ayarlayın") {
        addAlert("LinkedinBType2", "Bütçe türü günlük bütçe olmalı.");
      } else {
        removeAlert("LinkedinBType2");
      }
    }
  }
}
function checkCampaignName(Taxonomy) {
  const name = document.querySelector('input[id="campaign-name"]');
  if (Taxonomy) {
    if (
      Taxonomy === "BrandName|Platform|CampaignName|Objective|StartDate|EndDate"
    ) {
      const regex =
        /^[A-Za-z0-9]+(?:\|[A-Za-z0-9]+){3}\|\d{4}-\d{2}-\d{2}\|\d{4}-\d{2}-\d{2}$/;
      if (!regex.test(name.value.toLowerCase())) {
        addAlert("alert1544", "Taxonomy yapısı hatalı!1");
      } else {
        removeAlert("alert1544");
      }
    }
    if (
      Taxonomy === "BrandName_Platform_CampaignName_Objective_StartDate_EndDate"
    ) {
      const regex =
        /^[A-Za-z0-9]+_[A-Za-z0-9]+_[A-Za-z0-9]+_[A-Za-z0-9]+_\d{4}-\d{2}-\d{2}_\d{4}-\d{2}-\d{2}$/;
      if (!regex.test(name.value.toLowerCase())) {
        addAlert("alert1544", "Taxonomy yapısı hatalı!2");
      } else {
        removeAlert("alert1544");
      }
    }
    if (
      Taxonomy === "BrandName-Platform-CampaignName-Objective-StartDate-EndDate"
    ) {
      const regex =
        /^[A-Za-z0-9]+(?:-[A-Za-z0-9]+){3}-\d{4}-\d{2}-\d{2}-\d{4}-\d{2}-\d{2}$/;
      if (!regex.test(name.value.toLowerCase())) {
        addAlert("alert1544", "Taxonomy yapısı hatalı!3");
      } else {
        removeAlert("alert1544");
      }
    }
  }
}
let begin1 = false;

function lBExceed() {
  var publishDiv2 = Array.from(document.querySelectorAll("button")).find(
    (div) => div.textContent.trim() === "İleri"
  );

  if (linkedinBExceed && publishDiv2) {
    console.log("bütçe aşıldı");

    publishDiv2.style.position = "relative"; // Tooltip için referans noktası
    publishDiv2.style.cursor = "not-allowed"; // Kullanıcıya görsel olarak pasiflik belirt
    publishDiv2.style.opacity = "0.9"; // Görsel olarak pasif görünmesi için opaklık ayarla
    publishDiv2.style.backgroundColor = "red";
  } else {
    console.log("bütçe aşılmadı");

    publishDiv2.style.backgroundColor = "blue";
    publishDiv2.style.cursor = "default"; // Kullanıcıya görsel olarak pasiflik belirt
  }
}
function lBExceed2() {
  var publishDiv = Array.from(document.querySelectorAll("button")).find(
    (div) => div.textContent.trim() === "İleri"
  );
  const publishDiv2 = document.querySelector(
    'button[disabled][style*="background-color: red;"]'
  );
  var tooltip = document.createElement("span");
  tooltip.textContent = "Bütçe aşıldığı için kampanya Publish edilemez."; // Tooltip mesajı
  tooltip.style.position = "absolute";
  tooltip.style.width = "420px";
  tooltip.style.backgroundColor = "black";
  tooltip.style.color = "white";
  tooltip.style.padding = "5px";
  tooltip.style.borderRadius = "5px";
  tooltip.style.fontSize = "12px";
  tooltip.style.visibility = "hidden"; // Başlangıçta gizli
  tooltip.style.whiteSpace = "nowrap"; // Tek satırda göster
  tooltip.style.bottom = "125%"; // Div'in üstüne konumlandır
  tooltip.style.left = "50%";
  tooltip.style.transform = "translateX(-50%)"; // Ortalamak için
  tooltip.style.zIndex = "1000";

  if (linkedinBExceed) {
    if (publishDiv) {
      publishDiv.disabled = true;
      // Div'e tooltip için gerekli CSS özelliklerini ekle
      publishDiv.style.position = "relative"; // Tooltip için referans noktası
      publishDiv.style.cursor = "not-allowed"; // Kullanıcıya görsel olarak pasiflik belirt
      publishDiv.style.opacity = "0.9"; // Görsel olarak pasif görünmesi için opaklık ayarla
      publishDiv.style.backgroundColor = "red";

      // Tooltip elemanını oluştur

      // Tooltip'i div'in içine ekle
      publishDiv.appendChild(tooltip);

      // Hover olaylarını ekle
      publishDiv.addEventListener("mouseenter", () => {
        tooltip.style.visibility = "visible";
      });

      publishDiv.addEventListener("mouseleave", () => {
        tooltip.style.visibility = "hidden";
      });
    }
  } else {
    publishDiv2.disabled = false;
    publishDiv2.style.backgroundColor = "blue";
    publishDiv2.style.cursor = "default"; // Kullanıcıya görsel olarak pasiflik belirt
    var extooltip = Array.from(document.querySelectorAll("span")).find(
      (div) => div.textContent.trim() === "Bütçe aşıldığı için kampanya Publish edilemez."
    );
    if (publishDiv2 && publishDiv2.querySelector("span")) {
      publishDiv2.removeChild(extooltip);
    }
  }
}

setupLinkedInHandlers();

///////////////

var targetNode = document.body;
var config = { attributes: true, childList: true, subtree: true };

var observer = new MutationObserver(callback);
observer.observe(targetNode, config);

observeDOMChanges();
callback();

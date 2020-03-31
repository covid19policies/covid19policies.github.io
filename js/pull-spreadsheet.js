
const resources = {
  global: "_global",
  "US": "_us"
};
const org = "covid19policies";
const repo = "covid19policies.github.io";
const branch = "master";

let key = Cookies.get("spreadsheetid");
// Grab the token from cookie
let OAuthToken = Cookies.get("token");

const printInfos = function(info) {
  $("#table_info").val(function(i, text) {
    return text + info;
  });
};

const printGithubInfos = function(info) {
  $("#github_info").val(function(i, text) {
    return text + info;
  });
};

const extractTsv = function(elements) {
  let tsv = "id\tname\tlevel\n";
  for (let i = 0; i < elements.length; i++) {
    tsv+= elements[i].id+"\t"+elements[i].name+"\t"+elements[i].level+"\n";
  }
  return tsv;
};

const showInfo = function(data, tabletop) {
  if (!tabletop.sheets("_global")) {
    printInfos("\nERROR: global data not available");
    return;
  }
  if (!tabletop.sheets("_us")) {
    printInfos("\nERROR: US data not available");
    return;
  }
  printInfos("We found the tables " + tabletop.model_names.join(", "));
  if (
    !tabletop.sheets("_global").columnNames.some(col => col === "id")
  ) {
    printInfos("global data missing column 'id'");
    return;
  } else if (
    !tabletop.sheets("_global").columnNames.some(col => col === "name")
  ) {
    printInfos("global data missing column 'name'");
    return;
  } else if (
    !tabletop.sheets("_global").columnNames.some(col => col === "level")
  ) {
    printInfos("global data missing column 'level'");
    return;
  }
  if (
    !tabletop.sheets("_us").columnNames.some(col => col === "id")
  ) {
    printInfos("US data missing column 'id'");
    return;
  } else if (
    !tabletop.sheets("_us").columnNames.some(col => col === "name")
  ) {
    printInfos("US data missing column 'name'");
    return;
  } else if (
    !tabletop.sheets("_us").columnNames.some(col => col === "level")
  ) {
    printInfos("US data missing column 'level'");
    return;
  }

  $.each( tabletop.sheets(), function(i, sheet) {
    printInfos("\n" + sheet.name + " has [" + sheet.column_names.join(", ")+"]");
  });
  if (key !== "") {
    // Setting a cookie value
    Cookies.set("spreadsheetid", key);
  }

  const globalTsv = extractTsv(tabletop.sheets("_global").all());
  const usTsv = extractTsv(tabletop.sheets("_us").all());
  $("#global_source").val(function() {
    return globalTsv;
  });
  $("#US_source").val(function() {
    return usTsv;
  });

  const updateGithub = function() {
    if (OAuthToken !== "") {
      // Setting a cookie value
      Cookies.set("token", OAuthToken);
      // Set with expiration
      // Cookies.set("token", $oAuthToken, { expires: "01/01/2017" });
    } else {
      printGithubInfos("ERROR: no token\n");
    }
    $("#update-github").addClass("disable").removeClass("active").off("click");
    const github = new Github({token: OAuthToken, auth: "oauth"});
    const repository = github.getRepo(org, repo);

    const date = new Date();
    const dateString = (date.getDate().toString().length === 1? "0" : "")+date.getDate()+"_"+
      ((date.getMonth()+1).toString().length === 1? "0" : "")+(date.getMonth() + 1)+"_"+
      date.getFullYear();

    const globalCurrentPath = "data/current_global.tsv";
    const usCurrentPath = "data/current_US.tsv";
    const globalHistoryPath = "data/history/"+dateString+"_global.tsv";
    const usHistoryPath = "data/history/"+dateString+"_US.tsv";

    let globalCurrentSHA = null;
    let usCurrentSHA = null;
    let globalHistorySHA = null;
    let usHistorySHA = null;

    printGithubInfos("****** getting github repo ******\n");

    repository.getTree(branch + "?recursive=true", function(err, tree) {
      printGithubInfos("got it!\n\n");
      tree.forEach(obj => {
        if (obj.path === globalCurrentPath) {
          globalCurrentSHA = obj.sha;
        } else if (obj.path === usCurrentPath) {
          usCurrentSHA = obj.sha;
        } else if (obj.path === globalHistoryPath) {
          globalHistorySHA = obj.sha;
        } else if (obj.path === usHistoryPath) {
          usHistorySHA = obj.sha;
        }
      });
      printGithubInfos("****** updating files ******\n");

      new Promise(function(resolve, reject) {
        repository.writemanual(
          "master",
          globalCurrentPath,
          globalTsv,
          "Save Global current Update from site",
          globalCurrentSHA,
          function(err) {
            if (!err) {
              printGithubInfos(globalCurrentPath + " done\n");
              resolve();
            } else {
              printGithubInfos(err.path + "failed");
              reject();
            }
          }
        );
      })
      .then(() => {
        return new Promise(function(resolve, reject) {
          repository.writemanual(
            "master",
            usCurrentPath,
            usTsv,
            "Save US current Update from site",
            usCurrentSHA,
            function(err) {
              if (!err) {
                printGithubInfos(usCurrentPath + " done\n");
                resolve();
              } else {
                printGithubInfos(err.path + "failed");
                reject();
              }
            }
          );
        });
      })
      .then(() => {
        return new Promise(function(resolve, reject) {
          repository.writemanual(
            "master",
            globalHistoryPath,
            globalTsv,
            "Save Global history Update from site",
            globalHistorySHA,
            function(err) {
              if (!err) {
                printGithubInfos(globalHistoryPath + " done\n");
                resolve();
              } else {
                printGithubInfos(err.path + "failed");
                reject();
              }
            }
          );
        });
      })
      .then(() => {
        return new Promise(function(resolve, reject) {
          repository.writemanual(
            "master",
            usHistoryPath,
            usTsv,
            "Save US history Update from site",
            usHistorySHA,
            function(err) {
              if (!err) {
                printGithubInfos(usHistoryPath + " done\n");
                resolve();
              } else {
                printGithubInfos(err.path + "failed");
                reject();
              }
            }
          );
        });
      })
      .then(() => {
        printGithubInfos("\n****** ALL DONE ******");
      },() => {
        printGithubInfos("\n****** ABORTED DUE TO ERRORS ******");
      });
    });
  };

  $("#update-github").removeClass("disable").addClass("active").on("click",updateGithub);
};

const getSheet = function() {
  Tabletop.init({ key: key,
    callback: showInfo,
    error: function() {
      printInfos("ERROR: failed to get spreadsheet. Check if spreadsheet id is correct.");
    },
    wanted: [
      resources.global,
      resources.US
    ],
    debug: true
  });
};

$(document).ready( function() {
  $("#get-sheet").on("click", getSheet);
  if (Cookies.get("token")) {
    OAuthToken = Cookies.get("token");
    $("#github-token").val(OAuthToken);
  }
  if (Cookies.get("spreadsheetid")) {
    key = Cookies.get("spreadsheetid");
    $("#spreadsheetid").val(key);
  }
  $("#github-token").on("input", function() {
    const val = $(this).val();
    OAuthToken = val;
  });
  $("#spreadsheetid").on("input", function() {
    const val = $(this).val();
    key = val;
  });
});

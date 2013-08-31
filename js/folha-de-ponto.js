/**
 * Estrutura para o projeto Folha de ponto mobile
 * @author Wildiney Di Masi
 * @version 1.0
 */

/**
 *
 * @type type
 */
var db;

/**
 *
 * @type String
 */
var database = "ponto";

/**
 *
 * @type String
 */
var version = "1.0";

/**
 *
 * @type String
 */
var displayName = "ponto";

/**
 *
 * @type Number
 */
var maxSize = 2 * 1024 * 1024;

/**
 *
 * @type Date
 */
var date = new Date();

/**
 *
 * @type String
 */
var currentDate = date.getFullYear() + "-" + addZero((date.getMonth() + 1)) + "-" + addZero(date.getDate());

/**
 *
 * @type String
 */
var currentTime = addZero(date.getHours()) + ":" + addZero(date.getMinutes());

/**
 * saveConfig
 * @returns {undefined}
 */
function saveConfig() {
    window.localStorage.setItem('empresa', $("input[name='input_empresa']").val());

    window.localStorage.setItem('entrada', $("select[name='input_entrada']").val());
    window.localStorage.setItem('almoco', $("select[name='input_almoco']").val());
    window.localStorage.setItem('retorno', $("select[name='input_retorno']").val());
    window.localStorage.setItem('saida', $("select[name='input_saida']").val());
}

/**
 * addZero
 * @param {type} value
 * @returns {String}
 */
function addZero(value) {
    if (value < 10) {
        value = "0" + value;
    }
    return value;
}

/**
 * onError
 * @param {type} transaction
 * @param {type} error
 * @returns {undefined}
 */
function onError(transaction, error) {
    console.log(error.message);
}

/**
 * createTable
 * @returns {void}
 */
function createTable() {
    db.transaction(function(transaction) {
        var sql = "CREATE TABLE IF NOT EXISTS ponto (id INTEGER PRIMARY KEY AUTOINCREMENT, data DATE NOT NULL, entrada TIME NOT NULL DEFAULT '00:00:00', almoco  TIME NOT NULL DEFAULT '00:00:00', retorno TIME NOT NULL DEFAULT '00:00:00', saida  TIME NOT NULL DEFAULT '00:00:00');";
        transaction.executeSql(sql, [], console.log(transaction), onError);
    });
}

/**
 * deselectPeriod
 * @returns {void}
 */
function deselectPeriod() {
    $("#entrada").attr("checked", false).checkboxradio("refresh");
    $("#almoco").attr("checked", false).checkboxradio("refresh");
    $("#retorno").attr("checked", false).checkboxradio("refresh");
    $("#saida").attr("checked", false).checkboxradio("refresh");
}

/**
 * selectPeriod
 * @returns {void}
 */
function selectPeriod() {
    db.transaction(function(transaction) {
        transaction.executeSql("SELECT * FROM ponto WHERE data = ?", [currentDate], function(transaction, results) {
            var len = results.rows.length;
            console.log(len);
            if (len === 0) {
                $("#entrada").attr("checked", true).checkboxradio("refresh");
            } else {
                var row = results.rows.item(0);
                console.log(row);
                if (row['entrada'] === "00:00:00") {
                    deselectPeriod();
                    $("#entrada").attr("checked", true).checkboxradio("refresh");
                } else if (row['almoco'] === "00:00:00") {
                    deselectPeriod();
                    $("#almoco").attr("checked", true).checkboxradio("refresh");
                } else if (row['retorno'] === "00:00:00") {
                    deselectPeriod();
                    $("#retorno").attr("checked", true).checkboxradio("refresh");
                } else if (row['saida'] === "00:00:00") {
                    deselectPeriod();
                    $("#saida").attr("checked", true).checkboxradio("refresh");
                } else {
                    deselectPeriod();
                    $("#saida").attr("checked", true).checkboxradio("refresh");
                }
            }
        });
    });
}

/**
 * setup
 * @returns {void}
 */
function setup() {
    console.log("starting setup");

    /** Funções de configuração do aplicativo */
    $.mobile.loadingMessage = "Carregando";

    /** Setup das variáveis iniciais */
    if (localStorage.getItem("entrada") === null && localStorage.getItem("almoco") === null && localStorage.getItem("retorno") === null && localStorage.getItem('saida') === null) {
        window.localStorage.setItem("entrada", "08:00");
        window.localStorage.setItem("almoco", "12:00");
        window.localStorage.setItem("retorno", "13:00");
        window.localStorage.setItem("saida", "17:00");
    }

    /** Setup do banco */
    try {
        if (!window.openDatabase) {
            alert('Aplicativo não suportado neste depositivo');
        } else {
            db = openDatabase(database, version, displayName, maxSize);
        }
    } catch (e) {
        if (e === 2) {
            alert("Versão inválida do banco de dados");
        } else {
            alert("Erro desconhecido " + e + ".");
        }
        return;
    }

    /** Cria tabela no banco de dados se não existir */
    createTable();
    //loadDiario();

    console.log("finishing setup");
}

/**
 * updateReg
 * @param {string} periodo
 * @param {time} currentTime
 * @param {date} currentDate
 * @returns {void}
 */
function updateReg(periodo, currentTime, currentDate) {
    db.transaction(
            function(transaction) {
                transaction.executeSql("UPDATE ponto SET " + periodo + "=? WHERE data = ?;", [currentTime, currentDate], console.log('updated'), onError);
            }
    );
}

/**
 * deletarReg
 * @param {integer} id
 * @returns {void}
 */
function deletarReg(id) {
    db.transaction(
            function(transaction) {
                transaction.executeSql("DELETE FROM ponto WHERE id = ?;", [id], function() {
                    console.log('registro deletado');
                }, onError);
            }
    );
}

/**
 * registrar
 * @returns {undefined}
 */
function registrar() {
    console.log("funcao registrar");

    var periodo = $('#periodo :radio:checked').val();

    var date = new Date();
    var currentDate = date.getFullYear() + "-" + addZero((date.getMonth() + 1)) + "-" + addZero(date.getDate());
    var currentTime = addZero(date.getHours()) + ":" + addZero(date.getMinutes());

    db.transaction(function(transaction) {
        transaction.executeSql("SELECT * FROM ponto WHERE data = ?", [currentDate], function(transaction, results) {
            var len = results.rows.length;
            console.log(len);

            if (len === 0) {
                transaction.executeSql("INSERT INTO ponto ('data') VALUES (?)", [currentDate], console.log(currentDate), onError);
                updateReg(periodo, currentTime, currentDate);
                $.mobile.changePage("folha-de-ponto.html", {transition: "slideup"});
            } else {
                transaction.executeSql("SELECT * FROM ponto WHERE data = ? AND " + periodo + "<>'00:00:00'", [currentDate], function(transaction, results) {

                    var len = results.rows.length;

                    if (len === 0) {
                        updateReg(periodo, currentTime, currentDate);
                        $.mobile.changePage("folha-de-ponto.html", {transition: "slideup"});
                    } else {
                        $("#confirm").popup('open');
                    }
                }, onError);

            }
        }, onError);
    });
}

/**
 *
 * @param {type} value
 * @returns {String}
 */
function data_dm(value) {
    day = value.substr(8);
    month = value.substr(5, 2);

    return day + "/" + month;
}

/**
 *
 * @returns {undefined}
 */
function loadFolha() {
    db.transaction(function(tx) {
        tx.executeSql('SELECT * FROM ponto ORDER BY data desc', [], function(tx, results) {
            var len = results.rows.length;
            var entrada = window.localStorage.getItem('entrada');
            var almoco = window.localStorage.getItem('almoco');
            var retorno = window.localStorage.getItem('retorno');
            var saida = window.localStorage.getItem('saida');

            html = "<table class='tabela_de_horarios'>";
            html += "<tr><th>data</th><th>entrada</th><th>almoço</th><th>retorno</th><th>saida</th><th>apagar</th><tr>";
            for (var i = 0; i < len; i++) {
                var row = results.rows.item(i);
                if (row['entrada'] !== "00:00:00") {
                    if (row['entrada'].replace(":", "") > entrada.replace(":", "")) {
                        var class_entrada = "class='atraso'";
                    }
                }
                if (row['almoco'] !== "00:00:00" && row['retorno'] !== "00:00:00") {
                    if (row['almoco'].replace(":", "") + 1000 > row['retorno'].replace(":", "")) {
                        var class_almoco = "class='atraso'";
                    }
                }
                if (row['saida'] !== "00:00:00") {
                    if (row['saida'].replace(":", "") < saida.replace(":", "")) {
                        var class_saida = "class='atraso'";
                    }
                }

                html += "<tr>";
                html += "<td>" + data_dm(row['data']) + "</td>";
                html += "<td " + class_entrada + ">" + row['entrada'].substr(0, 5) + "</td>";
                html += "<td " + class_almoco + ">" + row['almoco'].substr(0, 5) + "</td>";
                html += "<td " + class_almoco + ">" + row['retorno'].substr(0, 5) + "</td>";
                html += "<td " + class_saida + ">" + row['saida'].substr(0, 5) + "</td>";
                html += "<td><a href='#' title='" + row['id'] + "' class='apagarbtn' data-inline='true' data-mini='true' data-iconpos='notext' data-icon='delete' data-role='button'></a></td>";
                html += "</tr>";
                class_entrada = "";
                class_almoco = "";
                class_saida = "";
            }
            html += "</table>";
            $("#resultados").html(html).trigger('create');
        });
    });
}

/**
 * loadDiario
 * @returns {undefined}
 */
function loadDiario() {
    db.transaction(function(tx) {
        tx.executeSql('SELECT * FROM ponto WHERE data=?', [currentDate], function(tx, results) {
            var len = results.rows.length;
            var entrada = localStorage.getItem('entrada');
            var almoco = localStorage.getItem('almoco');
            var retorno = localStorage.getItem('retorno');
            var saida = localStorage.getItem('saida');

            html = "<table class='tabela_de_horarios'>";
            html += "<tr><th>entrada</th><th>almoço</th><th>retorno</th><th>saida</th><tr>";
            for (var i = 0; i < len; i++) {
                var row = results.rows.item(i);
                if (row['entrada'] !== "00:00:00") {
                    if (row['entrada'].replace(":", "") > entrada.replace(":", "")) {
                        var class_entrada = "class='atraso'";
                    }
                }
                if (row['almoco'] !== "00:00:00" && row['retorno'] !== "00:00:00") {
                    if (row['almoco'].replace(":", "") + 1000 > row['retorno'].replace(":", "")) {
                        var class_almoco = "class='atraso'";
                    }
                }
                if (row['saida'] !== "00:00:00") {
                    if (row['saida'].replace(":", "") < saida.replace(":", "")) {
                        var class_saida = "class='atraso'";
                    }
                }


                html += "<tr>";
                html += "<td " + class_entrada + ">" + row['entrada'].substr(0, 5) + "</td>";
                html += "<td " + class_almoco + ">" + row['almoco'].substr(0, 5) + "</td>";
                html += "<td " + class_almoco + ">" + row['retorno'].substr(0, 5) + "</td>";
                html += "<td " + class_saida + ">" + row['saida'].substr(0, 5) + "</td>";
                html += "</tr>";
                class_entrada = "";
                class_almoco = "";
                class_saida = "";
            }
            html += "</table>";
            $("#diario").html(html).trigger('create');
        });
    });
}

/**
 *
 */
function batchInsert() {
    var sqls = $("#sqlinsert").val();
    var arraySQL = sqls.split(";");

    console.log(arraySQL);
    console.log(arraySQL.length);
    db.transaction(function(transaction) {
        for (var j = 0; j < arraySQL.length - 1; j++) {
            transaction.executeSql(arraySQL[j], [], console.log(arraySQL[j]), onError);
        }
    });
}

$(document).ready(function() {
    /** Execuções */
    setup();

    /** Actions */
    $('#bater').on("click", registrar);

    /** Popups */
    $("#confirm_update_yes").on("click", function() {
        var periodo = $('#periodo :radio:checked').val();
        var date = new Date();
        var currentDate = date.getFullYear() + "-" + addZero((date.getMonth() + 1)) + "-" + addZero(date.getDate());
        var currentTime = addZero(date.getHours()) + ":" + addZero(date.getMinutes());

        updateReg(periodo, currentTime, currentDate);
        $.mobile.changePage("folha-de-ponto.html", {transition: "slideup"});
    });

    $("#confirm_update_no").on("click", function() {
        $("#confirm").popup('close');
    });

    $(document).on('pageshow', '#updatemanual', function() {
        console.log('pageshow#updatemanual');
        $("#inserirDadosTabelaPonto").on("click", function() {
            batchInsert();
            $.mobile.changePage("folha-de-ponto.html", {transition: "slideup"});
        }).trigger('create');

    });

    $(document).on('click', '.apagarbtn', function() {
        var reglink = $(this).attr('title');
        deletarReg(reglink);
        loadFolha();
    });

    $(document).on('pageshow', '#configuracoes', function() {
        $("#input_empresa").val(window.localStorage.getItem('empresa'));
        $("#input_entrada option[value='" + window.localStorage.getItem('entrada') + "']").prop("selected", true).trigger("change");
        $("#input_almoco option[value='" + window.localStorage.getItem('almoco') + "']").prop("selected", true).trigger("change");
        $("#input_retorno option[value='" + window.localStorage.getItem('retorno') + "']").prop("selected", true).trigger("change");
        $("#input_saida option[value='" + window.localStorage.getItem('saida') + "']").prop("selected", true).trigger("change");

        $("#salvar").on("click", function() {
            saveConfig();
            $.mobile.changePage("index.html", {transition: "slideup"});
        });
    });

    $(document).on('pageshow', '#folha-de-ponto', function() {
        loadFolha();
    });

    $(document).on('pageshow', '#home', function() {
        console.log("#home.pageshow");
        loadDiario();
        selectPeriod();
    });

});


/**
 * Exemplos
 *
 * $("#periodo option[value='entrada']").prop("selected",true).trigger("change");
 */
$(document).ready(function() {

    var date = new Date();
    var currentDate = date.getFullYear() + "-" + addZero((date.getMonth() + 1)) + "-" + addZero(date.getDate());
    var currentTime = addZero(date.getHours()) + ":" + addZero(date.getMinutes());

    // Banco de dados
    var db;
    var database = "ponto";
    var version = "1.0";
    var displayName = "ponto";
    var maxSize = 2 * 1024 * 1024;

    try {
        if (!window.openDatabase) {
            alert('not supported');
        } else {
            db = openDatabase(database, version, displayName, maxSize);
        }
    } catch (e) {
        if (e === 2) {
            alert("Invalid database version");
        } else {
            alert("Unknown error " + e + ".");
        }
        return;
    }

    function saveConfig() {
        localStorage.setItem('empresa', $("input[name='input_empresa']").val());

        localStorage.setItem('entrada', $("select[name='input_entrada']").val());
        localStorage.setItem('almoco', $("select[name='input_almoco']").val());
        localStorage.setItem('retorno', $("select[name='input_retorno']").val());
        localStorage.setItem('saida', $("select[name='input_saida']").val());

    }

    function addZero(value) {
        if (value < 10) {
            value = "0" + value;
        }
        return value;
    }

    function onError(transaction, error) {
        console.log(error.message);
    }

    function createTable() {
        db.transaction(function(transaction) {
            transaction.executeSql("CREATE TABLE IF NOT EXISTS ponto (id INTEGER PRIMARY KEY AUTOINCREMENT, data DATE NOT NULL, entrada TIME NOT NULL DEFAULT '00:00:00', almoco  TIME NOT NULL DEFAULT '00:00:00', retorno TIME NOT NULL DEFAULT '00:00:00', saida  TIME NOT NULL DEFAULT '00:00:00');", [], function(transaction) {
                console.log("table created");
            }, onError);
        });
    }

    function setup() {
        // $.mobile
        $.mobile.loadingMessage = "Carregando";

        // Config App
        if (
                localStorage.getItem("entrada") === null &&
                localStorage.getItem("almoco") === null &&
                localStorage.getItem("retorno") === null &&
                localStorage.getItem('saida') === null
                ) {
            $.mobile.changePage("configuracoes.html", {transition: "slideup"});
        } else {
            var entrada = localStorage.getItem("entrada");
            entrada = entrada.replace(":", "");

            createTable();

            db.transaction(function(transaction) {
                transaction.executeSql("SELECT * FROM ponto WHERE data = ?", [currentDate], function(transaction, results) {
                    var len = results.rows.length;

                    if (len === 0) {
                        //$("#periodo option[value='entrada']").prop("selected",true).trigger("change");
                        $("#entrada").attr("checked", true).checkboxradio("refresh");
                    } else {
                        var row = results.rows.item(0);
                        if (row['almoco'] === null) {
                            $("#almoco").attr("checked", true).checkboxradio("refresh");
                        } else if (row['retorno'] === null) {
                            $("#retorno").attr("checked", true).checkboxradio("refresh");
                        } else if (row['saida'] === null) {
                            $("#saida").attr("checked", true).checkboxradio("refresh");
                        } else {
                            $("#entrada").attr("checked", false).checkboxradio("refresh");
                            $("#almoco").attr("checked", false).checkboxradio("refresh");
                            $("#retorno").attr("checked", false).checkboxradio("refresh");
                            $("#saida").attr("checked", false).checkboxradio("refresh");
                        }
                    }
                });
            });
        }
    }

    function updateReg(periodo, currentTime, currentDate) {
        db.transaction(
                function(transaction) {
                    transaction.executeSql("UPDATE ponto SET " + periodo + "=? WHERE data = ?;", [currentTime, currentDate], function() {
                        console.log('updated');
                    }, onError);
                }
        );
    }

    function deletarReg(id) {
        db.transaction(
                function(transaction) {
                    transaction.executeSql("DELETE FROM ponto WHERE id = ?;", [id], function() {
                        console.log('registro deletado');
                    }, onError);
                }
        );
    }

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
                    transaction.executeSql("INSERT INTO ponto ('data','entrada') VALUES (?,?)", [currentDate, currentTime], function() {
                        console.log(currentDate, currentTime);
                    }, onError);
                    $.mobile.changePage("folha-de-ponto.html", {transition: "slideup"});
                } else {
                    $("#confirm").popup('open');
                }
            }, onError);
        });
    }

    // Actions
    $('#bater').on("click", registrar);

    // Popups
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
    })

    $(document).on('click', '.apagarbtn', function() {
        var reglink = $(this).attr('title');
        deletarReg(reglink);
        loadFolha();
    });

    function loadFolha() {
        db.transaction(function(tx) {
            tx.executeSql('SELECT * FROM ponto', [], function(tx, results) {
                var len = results.rows.length;
                var entrada = localStorage.getItem('entrada');
                var almoco = localStorage.getItem('almoco');
                var retorno = localStorage.getItem('retorno');
                var saida = localStorage.getItem('saida');

                html = "<table class='tabela_de_horarios'>";
                html += "<tr><th>data</th><th>entrada</th><th>almoço</th><th>retorno</th><th>saida</th><th>apagar</th><tr>";
                for (var i = 0; i < len; i++) {
                    var row = results.rows.item(i);
                    if (row['entrada'] !== null) {
                        if (row['entrada'].replace(":", "") > entrada.replace(":", "")) {
                            var class_entrada = "class='atraso'";
                        }
                    }
                    if (row['almoco'] !== null && row['retorno'] !== null) {
                        if (row['almoco'].replace(":", "") + 1000 > row['retorno'].replace(":", "")) {
                            var class_almoco = "class='atraso'";
                        }
                    }
                    if (row['saida'] !== null) {
                        if (row['saida'].replace(":", "") < saida.replace(":", "")) {
                            var class_saida = "class='atraso'";
                        }
                    }
                    html += "<tr>";
                    html += "<td>" + row['data'] + "</td>";
                    html += "<td " + class_entrada + ">" + row['entrada'] + "</td>";
                    html += "<td " + class_almoco + ">" + row['almoco'] + "</td>";
                    html += "<td " + class_almoco + ">" + row['retorno'] + "</td>";
                    html += "<td " + class_saida + ">" + row['saida'] + "</td>";
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





    $(document).on('pageshow', '#configuracoes', function() {

        $("#input_empresa").val(localStorage.getItem('empresa'));
        $("#input_entrada option[value='" + localStorage.getItem('entrada') + "']").prop("selected", true).trigger("change");
        $("#input_almoco option[value='" + localStorage.getItem('almoco') + "']").prop("selected", true).trigger("change");
        $("#input_retorno option[value='" + localStorage.getItem('retorno') + "']").prop("selected", true).trigger("change");
        $("#input_saida option[value='" + localStorage.getItem('saida') + "']").prop("selected", true).trigger("change");

        $("#salvar").on("click", function() {
            saveConfig();
            $("#saveConfig").popup('open');
        });
    });
    $(document).on('pageshow', '#folha-de-ponto', function() {
        loadFolha();
    });

    setup();

});
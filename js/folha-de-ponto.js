$.mobile.loadingMessage  = "Carregando";

            $(document).ready(function(){
                try{
                    if(!window.openDatabase){
                        alert('not supported');
                    } else {
                        var database = "ponto";
                        var version = "1.0";
                        var displayName = "ponto";
                        var maxSize = 2 * 1024 *1024;
                
                        var db = openDatabase(database,version,displayName,maxSize);
                    }
                } catch(e){
                    if(e == 2){
                        alert("Invalid database version");
                    } else {
                        alert("Unknown error "+e+".");
                    }
                    return;
                }
                                
                
                $('#bater').on("click",function(){
                    var periodo = $('#periodo').val();
                    var date = new Date();
                    var currentDate = date.getFullYear()+"/"+(date.getMonth()+1)+"/"+date.getDate();
                    var currentTime = date.getHours()+":"+date.getMinutes();
                    
                    db.transaction(function(transaction){
                        transaction.executeSql('CREATE TABLE IF NOT EXISTS ponto (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, data text, entrada text NOT NULL, almoco text, retorno DATE, saida text);');
                        if(periodo==="entrada"){
                            console.log("entrada");
                            transaction.executeSql(
                                "INSERT INTO ponto ('data','entrada') VALUES ('"+currentDate+"','"+currentTime+"');"
                            );
                        }else{
                            console.log("UPDATE ponto SET '"+periodo+"'='"+currentTime+"' WHERE data = '"+currentDate+"';")
                            transaction.executeSql(
                                "UPDATE ponto SET '"+periodo+"'='"+currentTime+"' WHERE data = '"+currentDate+"';"
                            );
                        }
                    });
                    
                    console.log(periodo);
                    location.href="folha-de-ponto.html";
                });
                
                function loadFolha(){
                    db.transaction(function(tx){
                        tx.executeSql('SELECT * FROM ponto',[],function(tx,results){
                            var len = results.rows.length;
                            console.log("Foram encontrados " + len + " registros.");
                            html = "<table data-role='table' class='tabela_de_horarios'>";
                            html+= "<tr><th>data</th><th>entrada</th><th>almoço</th><th>retorno</th><th>saida</th><tr>";
                            for(var i = 0; i<len;i++){
                                var row = results.rows.item(i);
                                html +="<tr><td>"+row['data']+"</td><td>"+row['entrada']+"</td><td>"+row['almoco']+"</td><td>"+row['retorno']+"</td><td>"+row['saida']+"</td></tr>";
                            }
                            html+="</table>";
                            $("#resultados").html(html);
                        });
                    });
                }
				
			   $(document).on('pageshow', '#folha-de-ponto', function(){
					loadFolha();	
					});
            });
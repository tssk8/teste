/*cria um module e direciona para um controlador */
angular.module('bovespaApp', ['angularUtils.directives.dirPagination']).controller('bovespaListController', ['$http', '$scope', function($http, $scope){
  
  /* Declaração do socketio no cliente */
  var socket = io();

  $scope.dataHeader = [];
  $scope.dataCotacao = [];
  $scope.dataTrailer = [];

  $scope.notificacoes = [];

  $scope.contadornotificacao = 0;

  /* Buscar Informações da rota /filesCargaInicial no servidor */
  $http({method: 'GET', url: '/filesCargaInicial'}).then(function successCallback(data) {

      if(data.data.length == 0){
        alert("Nenhum Arquivo no Servidor!");
      }
      /* Recebe o objeto e guarda em arquivos */
      $scope.arquivos = data.data;

  }, function errorCallback(response) {
    console.log(response.data + " Status: " + response.status + " - " + response.statusText);
  });


  /* Buscar Informações da rota /dataBovespa no servidor */
    $http({method: 'GET', url: '/dataBovespa'}).then(function successCallback(data) {
       /* Recebe o objeto GET por /data */
      $scope.dataHeader.bovespaHeaderData = data.data[0];
      $scope.dataCotacao.bovespaCotacaoData = data.data[1];
      $scope.dataTrailer.bovespaTrailerData = data.data[2]; 
      console.log(data.data[2]);

   }, function errorCallback(response) {
     console.log('Erro ao receber arquivo: ' + response);
   });

  /* Capturao o arquivo selecionado na select e envia para o servidor */
  $scope.capturaArquivoSelecionado = function(nome_arquivo){

    socket.emit("arquivoSelecionado", nome_arquivo);
    
  };

  $scope.resetnotificacao = function(){
  	
    $('.botaonotificacao:hover').css({"background": "rgba(9, 79, 125, .9)", 
                                "border-color": "rgba(9, 79, 125, .9)"});

    if($scope.contadornotificacao != 0){
      $scope.contadornotificacao = 0;
    }
    
  };
  
  /* Escutando serviceMonitorArquivos no servidor recebendo a lista de arquivos atualizada */
  socket.on("serviceMonitorArquivos", function(arquivosData){

    /* Atualiza a variável arquivos */
    $scope.arquivos = arquivosData;

    /* Atualiza o scopo */
    $scope.$apply();

  });

  /* Carga na tabela com base no arquivo selecionado */
  socket.on('arquivoSelecionado', function(arquivo) {

    $scope.dataHeader.bovespaHeaderData = arquivo[0];
    $scope.dataCotacao.bovespaCotacaoData = arquivo[1];
    $scope.dataTrailer.bovespaTrailerData = arquivo[3];
    $scope.$apply();
  }); 

  socket.on('serviceMonitorArquivosAlerta', function(arquivo) {

    $('.botaonotificacao').css({"background": "#c0392b", 
                                "border-color": "#c0392b"
                              });

    $scope.contadornotificacao++;

    $scope.notificacoes.push({status: " Arquivo "+arquivo.nome+" "+arquivo.status,
                              horario: arquivo.horario});

    $scope.$apply();

  });


}]);
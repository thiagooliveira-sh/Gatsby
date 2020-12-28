---
image: /assets/img/AWS.png
title: Tags Scheduler
description: O aws-tag-sched-ops é uma ferramenta para agendamento programáticos
  ou periodicos para recursos AWS, como Ec2, EBS e RDS. O agendador permite a
  inicialização, reboot, backup e desligamento das máquinas de forma automática
  baseada em tags.
date: 2020-12-28
category: aws
background: "#FF9900"
tags:
  - aws
  - tags
  - devops
categories: []
---


> **TODA A CONFIGURAÇÃO DE HORÁRIO É FEITA EM UTC**



## Processo de instalação

1. Antes de mais nada faça um fork ou clone o [projeto](https://github.com/sqlxpert/aws-tag-sched-ops) para a sua máquina
2. Faça login com uma conta que possua direitos administrativos
3. Crie um bucket para armazenamento do código em python para que possamos configurar para o lambda ( O código a ser importado deve ser o zip)
   3.1. Remova o acesso publico de leitura e escrita.
4. Va no painel do cloudformation e inicia a criação da stack, escolha o arquivo e faça o upload do arquivo `aws_tag_sched_ops.yaml`
   		4.1. Stack name: `TagSchedOps`
   4.2. LambdaCodeS3Bucket: `NOME DO BUCKET CRIADO COM O ZIP`
   4.3. MainRegion: `Região`
   4.4. Todas as demais configurações devem ser padrões
5. Configuração finalizada.

## Habilitar Operação

> Para habilitar a operação, basta adicionar a tag conforme a tabela abaixo descrita para cada serviço
{.is-info}


| |Start|Create Image|Reboot then Create Image|Reboot then Fail Over|Reboot|Create Snapshot|Create Snapshot then Stop|Stop|
  |--|--|--|--|--|--|--|--|--|
  |[EC2 compute instance](https://console.aws.amazon.com/ec2/v2/home#Instances)|`managed-start`|`managed-image`|`managed-reboot-image`| |`managed-reboot`| | |`managed-stop`|
  |[EC2 EBS disk volume](https://console.aws.amazon.com/ec2/v2/home#Volumes)| | | | | |`managed-snapshot`| | |
  |[RDS database instance](https://console.aws.amazon.com/rds/home#dbinstances:)|`managed-start`| | |`managed-reboot-failover`|`managed-reboot`|`managed-snapshot`|`managed-snapshot-stop`|`managed-stop`|
  
>  possível habilitar as tags para operações periódicas ou pontuais com o sufixo `-periodic`e `-once`


## Agendando operações

|Tags|Funciona?|Comentário|
  |--|--|--|
  |`managed-start` <br/>`managed-start-periodic`=`u=1,H=09,M=05`|Sim|Habilitado e Agendado|
  |`managed-start`=`No` <br/>`managed-start-periodic`=`u=1,H=09,M=05`|Sim|Valor da tag managed-start é sempre ignorado|
  |`managed-start` <br/>`managed-start-once`=`2017-12-31T09:05`|Sim||
  |`managed-start` <br/>`managed-start-periodic`=`u=1,H=09,M=05` <br/>`managed-start-once`=`2017-12-31T09:05`|Sim|Manter as tags -periodic e -once é permitido|
  |`managed-start`|No|Não em tag de agendamento|
  |`managed-start-once`=`2017-12-31T09:05`|Não|Não, sem tag de ativação a operação é pausada|
  |`managed-start` <br/>`managed-start-once`|Não|Não agendamento em branco|
  |`managed-start` <br/>`managed-start-periodic`=`Monday`|Não|Agendamento inválido|
  |`managed-start` <br/>`managed-stop-periodic`=`u=1,H=09,M=05`|Não|Tag de ativação corresponde a outra tag de operação|
  

### Agendamentos periódicos

* Sufixo: `-periodic`
* Um ou mais valores podem ser configurados
* Valores aceitos:

     |Nome|Minimo|Maximo|Wildcard|Combinações|
    |--|--|--|--|--|
    |Dia do mês (`d`)|`d=01`|`d=31`|`d=*`|`H` and `M`, or `H:M`|
    |Dia da semana (`u`)|`u=1` (Segunda)|`u=7` (Domingo)||`H` and `M`, or `H:M`|
    |Hora (`H`)|`H=00`|`H=23`|`H=*`|`d` or `u`, and `M`|
    |Minuto (`M`)|`M=00`|`M=59`||`d` or `u`, and `H`|
    |Hora e minuto (`H:M`)|`H:M=00:00`|`H:M=23:59`||`d` or `u`|
    |Dia do mês, hora e minuto (`dTH:M`)|`dTH:M=01T00:00`|`dTH:M=31T23:59`|||
    |Dia da semana, hora e minuto (`uTH:M`)|`uTH:M=1T00:00`|`uTH:M=7T23:59`|||
  
> 1. Para uma combinação válida necessário especificar o dia, hora e minuto
> 2. Repita um componente inteiro para especificar vários valores. Por exemplo, `d=01, d=11, d=21` significa o 1º, 11º e 21º dias do mês.
> 3. A configuração do Wildcard `*`  habilitada para quando for necessário, aplicasse para dias, horas e minutos
> 4. Para uma programação consistente de um dia por mês, evite `d=29` a `d=31`.

* Exemplos

    |Valores de agendamento `-periodic` |Demonstração|Operação começa|
    |--|--|--|
    |`d=28,H=14,M=25` ou `dTH:M=28T14:25`|Mensalmente|Entre as 14:20 e 14:30 no 28° dia todo mês.|
    |`d=1,d=8,d=15,d=22,H=03,H=19,M=01`|Agendamento semelhante ao`cron`|Entre as 03:00 e 03:10 e novamente entre as 19:00 e 19:10, no 1°, 8°, 15º e 22° dias todos os meses.|
    |`d=*,H=*,M=15,M=45,H:M=08:50`|Evento extra no dia|Entre 10 e 20 minutes depois da hora e 40 a 50 minutos depois da hora, a cada hora do dia, e também todos os dias as 08:50 e 09:00.|
    |`d=*,H=11,M=00,uTH:M=2T03:30,uTH:M=5T07:20`|Evento extra na semana|Entre 11:00 and 11:10 todos os dias, e também todas as Terças entre as 03:30 and 03:40 e toda Sexta entre 07:20 e 7:30.|
    |`u=3,H=22,M=15,dTH:M=01T05:20`|Evento extra no mês|Entre 22:10 e 22:20 toda Quinta, e também no primeiro dia do mês entre 05:20 e 05:30.|

> Lembre-se de utilizar espaços (`  `) invés de virgulas (`,`) no RDS! (para EC2, qualquer separador funciona



### Agendamentos One-time
 
  * Sufixo: `-once`

  * Valores: Um ou mais valores [ISO 8601 combined date and time strings](https://en.wikipedia.org/wiki/ISO_8601#Combined_date_and_time_representations), por exemplo: `2020-03-21T22:40` (21 de Março de 2020)
      * Lembre-se, o código é executado a cada 10 minutos o ultimo digito  sempre ignored
      * Omita segundos
      
## Combinações
Múltiplas operações não simultâneas são permitidas, apenas as configurações abaixo pode ser aplicado de forma simultânea:

|Recurso|Operação|Efeito|
|--|--|--|
|EC2 |Criar Imagem + Reboot|Reinicia e então Cria a Imagem|
|EC2 ou RDS|Stop + Reboot|Para a máquina|
|RDS|Stop + Create Snapshot|Cria o snapshot e depois Para|

Combinações não suportadas:

|Combinaço|Razão|Exemplo|
|--|--|--|
| Operações mutuamente exclusivas | Conflito de operações. | Start + Stop |
| A escolha da operação depende do estado atual da instância | O estado da instância pode mudar entre a consulta de status e o pedido de operação. | Iniciar + Reinicializar |
| Operações sequenciais ou dependentes | A ordem lógica nem sempre pode ser inferida. Além disso, as operações prosseguem de forma assíncrona; um pode não ser concluído a tempo de outro começar. Observe que Reinicializar e criar imagem (instância EC2) e Criar instantâneo e parar (instância RDS) são operações _únicas_ da AWS. | Iniciar + Criar imagem |
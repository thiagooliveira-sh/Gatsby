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

![awstag1](/assets/img/awstag1.png)

>  possível habilitar as tags para operações periódicas ou pontuais com o sufixo `-periodic`e `-once`

## Agendando operações

![awstag2](/assets/img/awstag2.png)

### Agendamentos periódicos

* Sufixo: `-periodic`
* Um ou mais valores podem ser configurados
* Valores aceitos:

![awstag3](/assets/img/awstag3.png)

> 1. Para uma combinação válida necessário especificar o dia, hora e minuto
> 2. Repita um componente inteiro para especificar vários valores. Por exemplo, `d=01, d=11, d=21` significa o 1º, 11º e 21º dias do mês.
> 3. A configuração do Wildcard `*`  habilitada para quando for necessário, aplicasse para dias, horas e minutos
> 4. Para uma programação consistente de um dia por mês, evite `d=29` a `d=31`.

* Exemplos

![awstag4](/assets/img/awstag4.png)

> Lembre-se de utilizar espaços () invés de virgulas (`,`) no RDS! (para EC2, qualquer separador funciona

### Agendamentos One-time

* Sufixo: `-once`
* Valores: Um ou mais valores [ISO 8601 combined date and time strings](https://en.wikipedia.org/wiki/ISO_8601#Combined_date_and_time_representations), por exemplo: `2020-03-21T22:40` (21 de Março de 2020)

  * Lembre-se, o código é executado a cada 10 minutos o ultimo digito  sempre ignored
  * Omita segundos

## Combinações

Múltiplas operações não simultâneas são permitidas, apenas as configurações abaixo pode ser aplicado de forma simultânea:

![awstag5](/assets/img/awstag5.png)

Combinações não suportadas:

![](/assets/img/awstag6.png)
---
image: /assets/img/AWS.png
title: Expandindo sua VPC para outras regioes atraves do AWS Local Zones
description: "Você está pronto para levar sua infraestrutura AWS para o próximo
  nível? Descubra o poder das AWS Local Zones e desbloqueie novas possibilidades
  para expandir sua arquitetura de VPC por várias regiões de maneira contínua. "
date: 2023-08-31
category: aws
background: "#FF9900"
tags:
  - AWSCloud
  - ExpansãoVPC
  - LocalZones
  - InfraestruturaEmNuvem
  - OtimizaçãoDeLatência
  - InovaçãoEmNuvem
categories:
  - AWSCloud
  - ExpansãoVPC
  - LocalZones
  - InfraestruturaEmNuvem
  - OtimizaçãoDeLatência
  - InovaçãoEmNuvem
---
As AWS Local Zones oferecem a capacidade de estender suas aplicações mais perto dos usuários finais, mantendo um desempenho de baixa latência. Imagine entregar seus serviços com uma velocidade impressionante para clientes em locais geográficos diversos, sem comprometer o desempenho ou a confiabilidade.

### Por Que Considerar as Local Zones?

1. **Latência Ultra-Baixa:** Com as Local Zones, você pode reduzir significativamente a latência para cargas de trabalho sensíveis à latência, aprimorando a experiência do usuário final.
2. **Alta Disponibilidade:** Espalhe suas aplicações por regiões para aumentar a tolerância a falhas e melhorar a disponibilidade.
3. **Escalabilidade:** Dimensione suas aplicações e serviços de forma contínua para atender às demandas de uma base global de usuários.
4. **Conformidade:** Atenda aos requisitos de residência de dados implantando recursos em áreas geográficas específicas.

Expandir sua VPC por meio das AWS Local Zones é um movimento estratégico para otimizar o desempenho, a disponibilidade e o alcance de sua infraestrutura. Se você está executando aplicações sensíveis à latência, serviços de streaming ou cargas de trabalho intensivas em dados, as Local Zones podem transformar sua arquitetura em nuvem.

**Criação de uma Local Zone**

As Local Zones podem ser habilitadas dentro do painel de EC2 de cada região, lembrando que em cada região teremos zonas locais distintas e que durante esse tutorial iremos realizar dentro da região de Virginia.

Como dito anteriormente, acesse o console de EC2, existirá um menu lateral em “**Account attributes**” nele existirá uma opção chamada “**zones**”:

![](/assets/img/local-zone-1.png)

Quando selecionada, teremos um retorno de todas as zonas que podem ser configuráveis para a região escolhida, nesse exemplo iremos escolher a sub zona de **Buenos Aires:**

![](/assets/img/local-zone-2.png)



Com issobasta selecionar a zona e confirmar a sua ativação, o processo de liberação da zona para utilização geral pode demorar alguns minutos mas logo logo será marcado como **Enabled**:

![](/assets/img/local-zone-3.png)



![](/assets/img/local-zone-4.png)

**Configuração de VPC e Subredes**

* Como associar a Local Zone à Virtual Private Cloud (VPC) e criar subredes.

**Implementação de Recursos na Local Zone**

* Demonstração de como implantar recursos, como instâncias EC2, bancos de dados, etc., na Local Zone.

**Considerações de Custos**

* Discussão sobre os custos associados à utilização das Local Zones e como otimizar o orçamento.

**Escalabilidade e Redundância**

* Orientações sobre como escalar e configurar redundância para garantir alta disponibilidade.

**Resolução de Problemas Comuns**

* Uma lista de problemas comuns que os usuários podem encontrar e como resolvê-los.
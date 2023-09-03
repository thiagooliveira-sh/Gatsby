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

Você pode ativar as Local Zones através do painel EC2 disponível em cada região. É importante ressaltar que em cada região, as Local Zones são distintas. Neste tutorial, estaremos realizando as configurações dentro da região de Virginia.

Como mencionado anteriormente, para habilitar as Local Zones, acesse o console da EC2. No menu lateral, procure por "**Account Attributes** e lá você encontrará a opção denominada "**Zones**":

![](/assets/img/local-zone-1.png)

Uma vez selecionada a opção "Zonas", você receberá uma lista de todas as zonas disponíveis para configuração na região escolhida. Neste exemplo, optaremos pela subzona de **Buenos Aires**, conforme mostrado na imagem abaixo:

![](/assets/img/local-zone-2.png)



Após selecionar a zona desejada, basta confirmar a ativação. É importante observar que o processo de liberação da zona para utilização geral pode levar alguns minutos, mas em breve ela será marcada como **Enabled**:

![](/assets/img/local-zone-3.png)



![](/assets/img/local-zone-4.png)

**Configuração de VPC e Subredes**

Após a ativação e disponibilidade para utilização, você terá a opção de escolher a Zona de Disponibilidade ao criar a subnets, e você notará que ela será diferente da AZ normalmente disponível em nossa região. Para realizar essa configuração, acesse o painel de VPC no seu console da AWS e vá para o menu de Subnets :

![](/assets/img/local-zone-5.png)

Durante a criação da nova sub-rede, preencha os campos obrigatórios, como o intervalo de endereços IP e o nome. Em seguida, expanda a opção de Zonas de Disponibilidade e observe que, no final da lista, você encontrará a Local Zone habilitada:

![](/assets/img/local-zone-6.png)

**Implementação de Recursos na Local Zone**

A partir deste ponto, você estará apto a criar recursos como EC2, EBS, RDS, Load Balancers, EKS, Elastic Cache e muitos outros. Para ilustrar, vamos criar uma instância EC2 como exemplo. Observe que, durante a configuração da rede, você poderá definir a nova máquina na zona configurada anteriormente.

![](/assets/img/local-zone-7.png)

É importante destacar que não será necessário sair da sua região atual, e a instância criada aparecerá na lista junto com as demais que já existem dentro dessa região, mantendo uma integração perfeita e facilitando a administração de recursos na Local Zone.

![](/assets/img/local-zone-8.png)

\
\
**Considerações de Custos**

Instâncias e outros recursos da AWS em zonas locais terão preços diferentes dos encontrados na região principal, a transferência de dados em zonas locais da AWS é cobrada com taxas específicas da zona local. Para isso consulte sempre os custos através da [documentação](https://aws.amazon.com/pt/ec2/pricing/on-demand/).

**Resolução de Problemas Comuns**

Durante o processo de configuração das Local Zones na AWS, é possível que você encontre alguns problemas comuns. Um deles pode ser relacionado à conectividade e roteamento, onde é importante verificar se as tabelas de roteamento estão configuradas corretamente para direcionar o tráfego para a Local Zone desejada. Outra questão comum envolve a escalabilidade e desempenho, onde é essencial monitorar os recursos alocados na Local Zone e ajustá-los conforme necessário para lidar com aumentos de carga. 

\
Por fim, espero que tenham compreendido a grande variedade de alternativas que temos com esse tipo de arquitetura, podendo ter mais de um ponto de presença aumentando a resiliência e disponibilidade das nossas aplicações.
---
image: /assets/img/AWS.png
title: EKS Pod Identity simplificando entrega de identidades IAM para aplicações
description: Em 2019, a introdução do IAM Roles for Service Accounts
  revolucionou a gestão de permissões no Kubernetes, permitindo a associação de
  funções IAM a contas de serviço.
date: 2024-01-16
category: aws
background: "#FF9900"
tags:
  - AWS
  - IAM
  - EKS
  - K8S
  - SEC
categories:
  - AWS
  - IAM
  - EKS
  - K8S
  - SEC
---
Essa abordagem propiciou a implementação do princípio de "last privilege", concedendo aos pods apenas as permissões estritamente necessárias. Essa prática capacitou os desenvolvedores a configurar suas aplicações com permissões detalhadas, alinhadas ao conceito de "least privilege". 

No ultimo AWS re:invent, em 2023, surge o EKS Pod Identity, um recurso AWS que promete aprimorar ainda mais a segurança e a eficiência na gestão de identidade em ambientes Kubernetes. Este artigo explora os alicerces e benefícios do EKS Pod Identity, delineando seu papel crucial no avanço da segurança e na simplificação do desenvolvimento de aplicações em contêineres.

### Desafios de identity em ambientes Kubernetes

Lidar com identidade em ambientes Kubernetes pode ser um verdadeiro quebra-cabeça. A coisa toda de dar as permissões certas para os contêineres fazerem o que precisam sem dar carta branca é tipo andar na corda bamba. Antigamente, conectar identidades Kubernetes a sistemas externos, como IAM na nuvem, era meio como misturar água e óleo. Uma bagunça! Ficar mexendo manualmente com credenciais e não ter uma solução única era garantia de dor de cabeça e riscos de segurança. 

É nesse cenário que entra o EKS Pod Identity, lançado como uma espécie de evolução turbo do IAM Roles for Service Accounts (IRSA), o EKS Pod Identity surge para dar um upgrade no jogo da identidade em ambientes Kubernetes. Se em tempos passados, o IRSA já trazia o poder de associar funções IAM a contas de serviço, agora, com o Pod Identity, a coisa fica ainda mais interessante. Imagina uma versão 2.0 que facilita ainda mais a vida dos desenvolvedores e aprimora a segurança nos clusters. O Pod Identity dá um passo à frente, simplificando a associação de identidades AWS diretamente aos pods em execução no Kubernetes.

E﻿ é isso que vamos aprender a fazer hoje, como o EKS Pod Identity funciona, como podemos configurar no nosso cluster e os principais pontos comparado com o IRSA.






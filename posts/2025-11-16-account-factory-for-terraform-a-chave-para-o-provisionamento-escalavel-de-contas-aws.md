---
image: /assets/img/AWS.png
title: "Account Factory for Terraform: A Chave para o Provisionamento Escalável
  de Contas AWS"
description: O gerenciamento de ambientes multi-contas na Amazon Web Services
  (AWS) é uma prática recomendada para isolamento de segurança, governança e
  otimização de custos. No entanto, a criação e a manutenção consistentes dessas
  contas podem se tornar um desafio operacional significativo. É neste cenário
  que o AWS Control Tower Account Factory for Terraform (AFT) se estabelece como
  uma solução fundamental.
date: 2025-11-16
category: aws
background: "#FF9900"
tags:
  - AWS
  - AFT
  - TERRAFORM
  - DEVOPS
  - CONTROL TOWER
  - IAC
  - AUTOMACAO
  - PROVISIONAMENTO
  - MULTICONTA
  - AWSCONTROLTOWER
categories:
  - AWS
  - AFT
  - TERRAFORM
  - DEVOPS
  - CONTROL TOWER
  - IAC
  - AUTOMACAO
  - PROVISIONAMENTO
  - MULTICONTA
  - AWSCONTROLTOWER
---
### **O que é o Account Factory for Terraform (AFT)?**

O AFT é um módulo Terraform mantido pela AWS que se integra ao AWS Control Tower para automatizar o provisionamento e a customização de novas contas AWS. Ele atua como uma camada de automação que estende a funcionalidade nativa do Control Tower, permitindo que as organizações apliquem o princípio de Infraestrutura como Código (IaC) à gestão de contas.

O principal objetivo do AFT é garantir que cada nova conta criada esteja em total conformidade com os padrões de segurança e governança da organização desde o primeiro momento. Ele faz isso definindo um pipeline de entrega contínua (CI/CD) que orquestra a criação da conta e a aplicação de customizações via Terraform.

### Pré-requisitos de Implantação

Antes de configurar e iniciar seu ambiente AFT, é fundamental garantir que os seguintes recursos e configurações estejam disponíveis:

* AWS Control Tower Landing Zone: É necessário ter uma Zona de Pouso (Landing Zone) do AWS Control Tower já estabelecida. O AFT é uma extensão do Control Tower e depende de sua estrutura de governança e contas centrais.
* Região de Origem (Home Region): A região onde a Landing Zone do Control Tower foi configurada é o ponto de partida para a implantação do AFT.
* Conta de Gerenciamento AFT: Uma conta AWS dedicada para hospedar os recursos do AFT (pipelines, DynamoDB, etc.). Esta conta deve ser provisionada via Control Tower ou inscrita nele.
* Terraform: Uma versão compatível e a distribuição do Terraform são necessárias para executar o módulo de instalação do AFT.
* Provedor de VCS (Version Control System): Um provedor para rastrear e gerenciar as alterações no código. Por padrão, o AFT utiliza o AWS CodeCommit, mas é possível configurar provedores externos como GitHub ou BitBucket.
* Ambiente de Runtime: Um ambiente onde o módulo Terraform que instala o AFT será executado.
* Opções de Recursos do AFT: A capacidade de habilitar ou desabilitar recursos específicos do AFT conforme a necessidade da organização.

### Arquitetura e Componentes Chave do AFT

A implantação do AFT ocorre em um ambiente gerenciado pelo AWS Control Tower, utilizando uma conta dedicada (AFT Management Account) para hospedar a maior parte dos seus recursos. O AFT interage com as contas centrais do Control Tower (Management, Log Archive e Audit) para orquestrar o fluxo de trabalho.

#### O Modelo GitOps e os Repositórios

O AFT adota um modelo GitOps, onde o estado desejado das contas é definido em repositórios Git. O AFT requer quatro repositórios principais para gerenciar o ciclo de vida das contas:

| Repositório                               | Propósito                                                                                                                                                         | Tipo de Customização                 |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| `aft-account-request`                     | Contém as requisições de novas contas, especificando o nome, e-mail e a Unidade Organizacional (OU) de destino.                                                   | Gatilho para o provisionamento.      |
| `aft-global-customizations`               | Define customizações que são aplicadas a todas as contas provisionadas pelo AFT. Exemplos incluem a criação de VPCs padrão, usuários IAM ou políticas de tagging. | Customizações de linha de base.      |
| `aft-account-customizations`              | Permite a aplicação de customizações específicas para contas individuais, com base em suas necessidades ou funções.                                               | Customizações específicas por conta. |
| `aft-account-provisioning-customizations` | Customizações aplicadas durante o processo de provisionamento, antes que a conta seja totalmente finalizada e registrada no Control Tower.                        | Customizações de bootstrap.          |

![diagrama](/assets/img/high-level-aft-diagram.png)

Não há cobrança adicional pelo AFT. Você paga somente pelos recursos implantados pelo AFT, por exemplo:

* Tempo de execução do CodepiPeline e CodeBuild
* Execuções no Step Functions e Lambdas
* Utilização do DynamoDB


#### Componentes de Orquestração

O AFT é um conjunto de serviços AWS orquestrados, incluindo:

* AWS CodePipeline e CodeBuild: Utilizados para construir os pipelines de CI/CD que executam o Terraform.
* AWS Step Functions: Orquestra o fluxo de trabalho complexo de provisionamento e customização, garantindo a execução correta das etapas.
* Amazon DynamoDB: Armazena o estado e os metadados das requisições de contas.
* AWS Service Catalog: O AFT utiliza o Account Factory do Control Tower, que é um produto do Service Catalog, para provisionar a conta base.

#### O Fluxo de Trabalho de Provisionamento de Contas

O processo de criação de uma nova conta via AFT é totalmente automatizado e orientado por código:

* 1 Requisição: Um usuário submete um arquivo de requisição (um arquivo .tf) para o repositório aft-account-request.
* 2 Gatilho: O push para o repositório dispara o pipeline principal do AFT.
* 3 Provisionamento Base: O AFT invoca o Account Factory do AWS Control Tower via Service Catalog para criar a conta AWS base.
* 4 Customizações de Provisionamento: O pipeline executa o código Terraform do repositório aft-account-provisioning-customizations para aplicar configurações iniciais.
* 5 Registro e Customizações Globais: A conta é registrada no Control Tower. Em seguida, o pipeline executa o código do repositório aft-global-customizations, aplicando a linha de base de segurança e infraestrutura a todas as contas.
* 6 Customizações Específicas: Por fim, o pipeline verifica o repositório aft-account-customizations e aplica quaisquer configurações específicas para a nova conta.
* 7 Conta Pronta: A conta está provisionada, customizada e pronta para uso, garantindo a conformidade desde o início.

#### Benefícios do AFT para o DevOps

A adoção do AFT transforma a maneira como as organizações gerenciam seus ambientes AWS, oferecendo benefícios diretos para a cultura DevOps:

* Padronização e Conformidade: Garante que todas as contas sigam um modelo padronizado e estejam em conformidade com as políticas de governança do Control Tower e as customizações definidas.
* Velocidade e Escalabilidade: Reduz o tempo de provisionamento de contas de horas para minutos, permitindo que as equipes de desenvolvimento obtenham novos ambientes rapidamente.
* Imutabilidade e Rastreabilidade: Ao tratar a infraestrutura de contas como código (IaC), qualquer alteração é rastreável via Git, facilitando auditorias e reversões.
* Foco em Valor: Libera os engenheiros de DevOps da tarefa manual e repetitiva de configurar contas, permitindo que se concentrem em entregar valor de negócio.

O Account Factory for Terraform é mais do que uma ferramenta de automação; é uma extensão da mentalidade DevOps para o nível de gestão de contas AWS. Ao combinar a governança robusta do AWS Control Tower com a flexibilidade e o poder do Terraform, o AFT permite que as organizações escalem suas operações na nuvem com segurança, consistência e agilidade. Para qualquer empresa que utilize o Control Tower e busque otimizar seu footprint na AWS, o AFT é uma peça indispensável na sua estratégia de nuvem.

Este artigo serviu como uma introdução conceitual e arquitetural. Nas próximas postagens, faremos uma transição para a prática, explorando em detalhes: como fazer o deploy inicial do AFT, o processo passo a passo para criar a primeira conta AWS, como criar um account-customization específico e dicas valiosas para definir seus global-customizations. Fique ligado para aprofundar seus conhecimentos e colocar o AFT em ação!


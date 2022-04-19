---
image: /assets/img/AWS.png
title: Criação de EC2 utilizando Cloudformation
description: O AWS CloudFormation é um serviço de infraestrutura como código
  (IaC) que permite modelar, provisionar e gerenciar recursos da AWS.
date: 2022-04-19
category: aws
background: "#FF9900"
tags:
  - aws
  - iac
  - cloudformation
categories:
  - aws
  - iac
  - cloudformation
---
Apesar de hoje possuirmos diversas ferramentas disponiveis para utilização de infraestrutura como código, como o Terraform, a AWS também possui a sua ferramenta nativa para atingir tais objetivos.

Tecnicamente CloudFormation é a forma oficial de definir infraestrutura como código na nuvem da AWS, portanto, é uma peça fundamental para possibilitar processos de entrega contínua e DevOps.

Diferente do Terraform, com o CloudFormation temos duas formas de realizar a declaração de infraestrutura, podemos utilizar tando o Json como o Yaml, fica a critério de cada um porem acredito que o Yaml fica melhor para visualização e compreensão das definições.

## AS SEÇÕES DO TEMPLATE

A estrutura completa de um template pode se tornar complexa, mas as mais importantes so as seções:

* `AWSTemplateFormatVersion`: Declara a versão do template.
* `Description`: Breve descrição do template, que pode ajudar a compreender quando existe uma grande quantidade de stacks.
* `Resources`: Onde todos os recursos que devem ser provisionados são declarados
* `Outputs`: Permite a visualização rápida de atributos de recursos criados utilizando a linha de comando e o console da aws. Quando é utilizado o parâmetro export ainda permite que outros stacks façam referência a esses atributos, permitindo um compartilhar informações entre diferentes stacks.

## PRIMEIRO TEMPLATE

Sabendo das necessidades que um template do CloudFormation tem, vamos entao criar um template que ira criar uma EC2, um Security Group e ira atachar um Elastic IP.

Sabendo que os recursos são declarados dentro da sessão `Resources`, vamos então iniciar pela definição da nossa EC2. Precisamos declarar algumas informações como `ImageId`, `InstanceType`, `SecurityGroups` e para isso vamos adicionar dentro da sessão resources a seguinte definição:

```yaml
  MyInstance:
    Type: AWS::EC2::Instance
    Properties:
      AvailabilityZone: us-east-1a
      ImageId: ami-03ededff12e34e59e
      InstanceType: t2.micro
      KeyName: Thiago
      SecurityGroups:
        - !Ref SSHSecurityGroup
      Tags: 
        - Key: Environment
          Value: Test
        - Key: Name
          Value: CloudFormation-Ec2
```

Com a nossa instancia declarada, vamos então atribuir um Elastic IP, assim matemos um IP publico fixo para a nossa EC2, para isso basta adicionar o seguinte bloco:

```yaml
  MyEIP:
    Type: AWS::EC2::EIP
    Properties:
      InstanceId: !Ref MyInstance
```

Dessa forma, falta apenas que criarmos um Security Group liberando a comunicação para SSH, iremos liberar para toda a internet, mas apenas por que isso e um lab, em ambiente real, filtre quem pode acessar suas instancias.

```yaml
  SSHSecurityGroup:
    Type: AWS::EC2::SecurityGroup
    Properties:
      GroupDescription: Enable SSH access via port 22
      SecurityGroupIngress:
      - CidrIp: 0.0.0.0/0
        FromPort: 22
        IpProtocol: tcp
        ToPort: 22
```

Bom, dessa forma devemos ter um template semelhante ao abaixo:

```yaml
---
Resources:
  MyInstance:
    Type: AWS::EC2::Instance
    Properties:
      AvailabilityZone: us-east-1a
      ImageId: ami-03ededff12e34e59e
      InstanceType: t2.micro
      KeyName: Thiago
      SecurityGroups:
        - !Ref SSHSecurityGroup
      Tags: 
        - Key: Environment
          Value: Test
        - Key: Name
          Value: CloudFormation-Ec2

  # an elastic IP for our instance
  MyEIP:
    Type: AWS::EC2::EIP
    Properties:
      InstanceId: !Ref MyInstance

  # our EC2 security group
  SSHSecurityGroup:
    Type: AWS::EC2::SecurityGroup
    Properties:
      GroupDescription: Enable SSH access via port 22
      SecurityGroupIngress:
      - CidrIp: 0.0.0.0/0
        FromPort: 22
        IpProtocol: tcp
        ToPort: 22
```

## CRIAR UMA STACK

Basta buscar na barra de pesquisa do console pelo serviço CloudFormation, caso não tenha  nenhuma stack, será retornado uma tela semelhante a abaixo, clique em `Create Stack`:

![](/assets/img/cf-01.png)

Basta clicar na opçao `Template Ready` e em seguida `Upload a template file`, la você deve enviar o arquivo yaml que criamos durante esse artigo:

![](/assets/img/cf-02.png)

Basta adicionar o nome da Stack e seguir as proximas configurações clicando em em `Next` ate a etapa de review e clicar em `Create Stack`:

![](/assets/img/cf-04.png)

Pronto, feito isso, a nossa stack foi criada e agora basta que você acompanhe a criação através da aba events, por la teremos visualização sobre a etapa de criação e em caso de erro, será reportado por la também.

![](/assets/img/cf-06.png)

Por fim, após o termino de todo processo de deploy da stack, podemos acessar a aba resources e por la verificar todos os recursos criados e seus respectivos ids:

![](/assets/img/cf-07.png)



Bom, é isso, espero que tenham curtido e entendido um pouco sobre como lançar instancias através do CloudFormation. Deixo tambem o link da documentação referente ao recurso [`AWS::EC2::Instance`](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-ec2-instance.html) para vocês verificarem todas as possibilidades de personalização.
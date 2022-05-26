---
image: /assets/img/AWS.png
title: "Cloudformation as principais funções intrínsecas "
description: "O Cloudformation possui uma variedade de funções intrínsecas para
  lhe auxiliar durante o seu desenvolvimento, são funções para conversão,
  referenciação e entre outras, facilitando a atribuição de valores às
  propriedades que não estão disponíveis até o runtime., "
date: 2022-05-20
category: aws
background: "#FF9900"
tags:
  - cloudformation
  - infraascode
  - iac
  - aws
categories:
  - cloudformation
  - infraascode
  - iac
  - aws
---
Você só pode usar funções intrínsecas em partes específicas do seu template Cloudformation. Atualmente, você pode usar em propriedades de recurso, saídas, atributos de metadados e atributos de política de atualização. Você também pode usar funções intrínsecas para criar condicionalmente recursos.

### Ref

A função intrínseca Ref acredito ser uma das mais importantes, pois ela retorna o valor do parâmetro ou recurso referenciado, que pode ser utilizado por exemplo quando você especifica o nome lógico de um parâmetro e ele retorna o valor do parâmetro.

E com isso temos varias aplicações, por exemplo, a declaração de recurso para um Elastic Ip precisa do ID de instância EC2 e usa a !Ref para especificar o ID de instância do recurso MyEC2Instance:

```
MyEIP:
  Type: "AWS::EC2::EIP"
  Properties:
    InstanceId: !Ref MyEC2Instance
``` 

### Mapping e FindInMap

O Mapping não é bem uma função, ele é uma forma de declararmos valores em formato de map, e é muito bom quando conhecemos antecipadamente todos os valores que podem ser obtidos, deduzido por variáveis, por exemplo Regiao, Availability Zones, Account, Environment:

```
Mapping:
  RegionMap:
    us-east-1:
      "32" : "ami-pka6aseljeafe68z4"
      "64" : "ami-ntndsv4evle1aqt6o"
    us-east-2:
      "32" : "ami-bxq31fmrtjyterbm8"
      "64" : "ami-066ee2fq4a9ef77f1"
...
```

Tendo essa visão do Mapping, conseguimos utilizando a Fn::FindInMap acessar esse map values:

```
...
  MyInstance:
    Type: AWS::EC2::Instance
    Properties:
      AvailabilityZone: us-east-1a
      ImageId: !FindInMap[RegionMap, !Ref"AWS::Region", 32]
      InstanceType: t2.micro
      KeyName: Thiago
      SecurityGroups:
        - !Ref SSHSecurityGroup
...
```

Dessa forma, vamos usar uma informação que o Cloudformation já sabe, que é a região em que ele ta sendo chamado e utilizara a chave 32 para pegar a informação da AMI com arquitetura 32 bits.

### Conditions

As funções de condições o nome já diz por si só, controlando a criação de recursos baseado em condições, as condições pode ser qualquer coisa, porém geralmente são baseadas em Environment, Region, Parâmetros e cada condição pode referenciar outra condição.

```
Conditions:
  CreateProdResources:!Equals[!Ref EnvType, prod]
```

As funções condicionais mais comuns são:

```
Fn::And
Fn::Equals
Fn::If
Fn::Not
Fn::Or
```

Bom, trouxe aqui apenas algumas das várias funções disponíveis para o Cloudformation, espero que tenha servido de introdução para futuros projetos!


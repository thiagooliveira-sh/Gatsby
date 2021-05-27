---
image: /assets/img/HashiCorp-Terraform-logo.png
title: Launch template personalizado para EKS com terraform
description: Uma das problemáticas de criar um cluster EKS sem muita
  personalização é que ele acaba gerenciando bastante recurso limitando a sua
  utilização.
date: 2021-05-27
category: devops
background: "#05A6F0"
tags:
  - devops
  - aws
  - eks
  - kubernetes
  - terraform
categories:
  - devops
  - aws
  - eks
  - kubernetes
  - terraform
---
Uma dos maiores problemas e que quandos criamos um cluster sem especificar um launch template ele vai acabar criando as maquinas com o Amazon Linux 2 porem essas que sao utilizadas pelo EKS sao as unicas que nao possuem o SSM instalado por padrao. 

A problemática aparece quando precisamos acessar os nodes, para qualquer tipo de ação ou análise a nível de host. Uma vez que os endereços variam sempre que o autoscale group cria um novo nó para o node group, acaba inviabilizando o acesso por ssh + chave privada quando pensamos em praticidade.

Pensando nisso, partimos para a abordagem de criarmos um launch template que realize a instalação do SSM e quando precisarmos realizar uma nova personalização teríamos liberdade para gerencia-la. 

Entao vamos la, nessa publicação não vamos abordar a configuração do cluster em geral, apenas a configuração de um módulo para launch template que será consumido durante o provisionamento do seu node group.

### Estrutura:

A estrutura de arquivos que utilizaremos, será a seguinte:

```
├── launch.tf
├── output.tf
├── userdata.tpl
└── variables.tf
```

* `launch.tf` = Arquivo principal que ira conter as informações do nosso launch template.
* `output.tf` = Arquivo que realizará o output das informações importantes para serem consumidas em outros módulos.
* `userdata.tpl` = Template que compõem o userdata da nossa instância.
* `variables.tf` = Arquivo de variáveis do módulo.

### Inputs
Nesse modulo precisaremos dos seguintes inputs:

* `Instance_type` = Definição da instância que será criada pelo launch template
* `kubernetes_version` = Versão do kubernetes utilizada pelo cluster
* `cluster_certificate` = Certificado CA do cluster EKS
* `cluster_endpoint` = API endpoint do cluster EKS
* `sg` = Lista de security groups adicional
* `cluster_security_group` = security group do cluster
* `cluster_name` = Nome do cluster
 
### Configuração

No arquivo launch.tf vamos precisar primeiro obter o ID da `AMI` que será utilizado pelo kubernetes e para isso vamos criar um `data source` buscando e utilizaremos a versão do kubernetes como parâmetro:

```
data "aws_ssm_parameter" "eks_ami" {
  name = "/aws/service/eks/optimized-ami/${var.kubernetes_version}/amazon-linux-2/recommended/image_id"
}
```

Feito isso, temos o ID da `AMI` do amazon linux referente a versão do nosso Kubernetes. Com essa informação vamos criar o nosso recurso de launch template:

```
resource "aws_launch_template" "eks_launch_template" {
  image_id               = data.aws_ssm_parameter.eks_ami.value
  instance_type          = var.instance_type
  name                   = "eks_launch_template-${var.cluster_name}"
  update_default_version = true
  
  vpc_security_group_ids = tolist([var.sg, var.cluster_security_group])

  user_data = base64encode(templatefile("${path.module}/userdata.tpl", { CLUSTER_NAME = var.cluster_name, B64_CLUSTER_CA = var.cluster_certificate, API_SERVER_URL = var.cluster_endpoint }))
}
```

Observe que o arquivo `userdata` começa a valer agora, uma vez que vamos utilizá-lo para definir de fato o parâmetro user_data do launch template, nele vamos personalizar com a configuração para cadastrá-lo no cluster e instalar o SSM:

```
MIME-Version: 1.0
Content-Type: multipart/mixed; boundary="==MYBOUNDARY=="

--==MYBOUNDARY==
Content-Type: text/x-shellscript; charset="us-ascii"

#!/bin/bash
set -ex

exec > >(tee /var/log/user-data.log|logger -t user-data -s 2>/dev/console) 2>&1

yum install -y amazon-ssm-agent
systemctl enable amazon-ssm-agent && systemctl start amazon-ssm-agent

/etc/eks/bootstrap.sh ${CLUSTER_NAME} --b64-cluster-ca ${B64_CLUSTER_CA} --apiserver-endpoint ${API_SERVER_URL}

--==MYBOUNDARY==--\
```

Bom, feito isso praticamente o nosso launch template encontra-se pronto e basta que os devidos outputs sejam configurados para que ele possa ser parametrizado dentro da criação do seu node group, as informações necessárias são as seguintes.

```
output "launch_template_name" {
    value = aws_launch_template.eks_launch_template.name
}

output "launch_template_version" {
    value = aws_launch_template.eks_launch_template.latest_version
}
```

É isso pessoal, espero que essa publicação seja útil  e que tenham gostado!
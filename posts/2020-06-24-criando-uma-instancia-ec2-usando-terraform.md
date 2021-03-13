---
image: /assets/img/HashiCorp-Terraform-logo.png
title: Criando uma instância EC2 usando Terraform
description: O Terraform é uma das ferramentas de infraestrutura muito popular e
  um dos produtos da HashiCorp
date: 2020-06-24
category: devops
background: "#05A6F0"
tags:
  - Devops
  - Terraform
categories:
  - Devops
---
O Terraform é uma ferramenta para construir, alterar e criar versões de infraestrutura com segurança e eficiência. O Terraform pode gerenciar provedores de serviços existentes e populares, bem como soluções personalizadas internas.

Os arquivos de configuração descrevem para Terraform os componentes necessários para executar um único aplicativo ou todo o seu datacenter. O Terraform gera um plano de execução descrevendo o que fará para atingir o estado desejado e, em seguida, executa-o para construir a infraestrutura descrita. À medida que a configuração muda, o Terraform pode determinar o que mudou e criar planos de execução incrementais que podem ser aplicados.

A infraestrutura que o Terraform pode gerenciar inclui componentes de baixo nível, como instâncias de computação, armazenamento e rede, além de componentes de alto nível, como entradas DNS, recursos SaaS, etc.

Indo direto ao ponto, realizaremos a criação de uma instância free tier na AWS. Mas antes disso é necessário saber os principais comandos do Terraform:

* `terraform init` : baixa os plugins necessários para executar o código.
* `terraform plan` : mostra o plano de ação que o Terraform irá realizar na infra.
* `terraform apply`: executa todo o plano de ação configurado. 
* `terraform destroy`: irá destruir tudo que foi aplicado no provider.

### Instalando Terraform:

Para fazer a devida instalação basta clicar [aqui ](https://www.terraform.io/downloads.html)e selecionar a sua distro, neste caso vou usar o Linux.

Com o download feito, vamos a configuração:

1. Instale o pacote unzip: 

```shell
sudo apt-get install unzip
```

1. Descompate e mova o binário para o diretório \`/usr/local/bin\`:

```shell
unzip terraform_0.12.26_linux_amd64.zip
sudo mv terraform /usr/local/bin/
```

1. Feito isso, para testar executamos o comando abaixo: 

```shell
terraform --version
```

### Criação de usuário na AWS

Para que possamos criar os nossos recursos será necessário criamos o nosso usuário na AWS, para isso basta seguir os passos da [documentação](https://docs.aws.amazon.com/pt_br/IAM/latest/UserGuide/id_users_create.htmlhttps://docs.aws.amazon.com/pt_br/IAM/latest/UserGuide/id_users_create.html) .

Todos o processo abordado aqui poderá ser feito utilizando a conta [free tier](https://aws.amazon.com/pt/free/?all-free-tier.sort-by=item.additionalFields.SortRank&all-free-tier.sort-order=asc) da AWS, sem envolver nenhum tipo de custo.

Com o usuário criado e aplicado a um grupo de acesso, salve o seu ID e Chave pois será utilizado pelo Terraform para se autenticar com o seu provider.

### Configurando credenciais

Para configurar as suas credenciais é bastante simples, você pode fazer isso instalando o [AWS cli](https://docs.aws.amazon.com/pt_br/cli/latest/userguide/install-cliv2-linux.html) ou criando um arquivo qualquer na sua máquina e adicionar as seguintes informações:

```shell
[default]
aws_access_key_id = SUA_KEY
aws_secret_access_key = SUA_SECRET_KEY
```

### Configuração da instância

Criaremos um arquivo chamado `main.tf` no qual será feito as configurações da instância que desejamos subir, observe o arquivo logo abaixo:

```shell
provider "aws" {
  region  = "us-east-1"
  shared_credentials_file = "/home/thiago/.aws/credentials"
  profile = "default"
}

resource "aws_instance" "Teste" {
  ami = "ami-01d025118d8e760db"
  instance_type = "t2.micro"
  key_name = "Thiago"
  tags = {
    Name = "lab-terraform-tst"
  }
}
```

No arquivo acima descrevemos o nosso provider sendo `aws` repassando as nossas credenciais, profile e região. Em seguida descrevemos como será configurada a nossa instância, foi escolhida uma ami do Amazon Linux, na família "t2.micro" elegível para free tier, assimilando a minha chave de acesso ( Já existente na AWS ) e por fim declarando o seu Nome para `lab-terraform-tst`.

### Iniciando o terraform

Feito toda a configuração, prepararemos o nosso diretório usando o comando `terraform init` para realizar o download dos plugins da AWS. Você verá que tudo deu certo caso tenha essa mensagem durante o retorno:

```
Terraform has been successfully initialized!
```

Agora executaremos o comando `terraform plan` . Isso nos permitirá ver o plano de ação que o Terraform fará antes de decidirmos definir a infra, esse comando pode demorar um pouco, verifique se as informações seguem de acordo com o planejado nos arquivos, no fim o seu plan deve ter algo semelhante a esse.

```shell
Plan: 1 to add, 0 to change, 0 to destroy.
```

Sabendo tudo que o Terraform vai fazer podemos partir para a criação, executamos o comando `terraform apply`:

```shell
# terraform apply
An execution plan has been generated and is shown below.
Resource actions are indicated with the following symbols:
  + create
Plan: 1 to add, 0 to change, 0 to destroy.
Do you want to perform these actions?
  Terraform will perform the actions described above.
  Only 'yes' will be accepted to approve.
Enter a value: yes
aws_instance.Teste: Creating...
aws_instance.Teste: Still creating... [10s elapsed]
aws_instance.Teste: Still creating... [20s elapsed]
aws_instance.Teste: Still creating... [30s elapsed]
aws_instance.Teste: Still creating... [40s elapsed]
aws_instance.Teste: Creation complete after 40s [id=i-0f7e4c2a21bf6949c]
Apply complete! Resources: 1 added, 0 changed, 0 destroyed.
```

Se formos para o console da AWS, podemos ver que uma instância t2.micro foi criada usando o Terraform:

![](/assets/img/Terraform01.png)

Para evitar cobranças, por se tratar de um ambiente de lab execute o comando `terraform destroy` para remover tudo o que foi criado durante esse artigo.

Esse artigo cobre apenas o básico sobre a criação de uma instância, indico que veja a documentação para algo mais elaborado, como criação/atribuição de security groups, vpc's, etc.

Fontes: [terraform](https://www.terraform.io/docs/cli-index.html), [aws_provider](https://www.terraform.io/docs/providers/aws/index.html), [aws_instance](https://www.terraform.io/docs/providers/aws/d/instance.html).
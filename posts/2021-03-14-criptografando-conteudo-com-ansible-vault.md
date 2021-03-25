---
image: /assets/img/ansible-logo.png
title: " Criptografando conteudo com Ansible Vault"
description: O Ansible Vault criptografa variáveis ​​e arquivos para que você
  possa proteger conteúdo confidencial, como senhas ou chaves, em vez de
  deixá-los disponíveis nas suas tasks..
date: 2021-03-25
category: devops
background: "#05A6F0"
tags:
  - Linux
  - Ansible
  - Devops
categories:
  - Linux
  - Ansible
  - Devops
---
Para usar o Ansible Vault, você precisa de uma ou mais senhas para criptografar e descriptografar o conteúdo. Se você armazenar suas senhas do vault em uma ferramenta de terceiros, como um secret manager, precisará de um script para acessá-las. 

Use as senhas com a ferramenta de linha de comando `ansible-vault` para criar e visualizar variáveis ​​criptografadas, criar arquivos criptografados, criptografar arquivos existentes ou editar, redigitar ou descriptografar arquivos.

Para o Ansible Vault conseguir criptografar e manter a mínima segurança, ele utiliza a chave simétrica AES(Symmetrical Key Advanced). A chave AES provê um caminho simples de utilização já que utiliza a mesma informação de chave de criptografia para chave de decriptografia.

### Processo

O processo de criptografia e descriptografia é bem simples e pode ser feito com uma única linha de comando. Para criarmos o arquivo criptografado, utilizaremos a seguinte sintaxe:

````
ansible-vault create <arquivo>
````

Será solicitado uma senha para que só os que a possui conseguirem abrir o conteúdo. Feito isso, o arquivo estará criptografado, caso tente abrir sem o `ansible-vault` será retornado algo semelhante a isso:

````
$ cat senhas 
$ANSIBLE_VAULT;1.1;AES256
32623665326138333534333731386338366466633535623561346535613663343565643461323533
3838616365653039383731613464396537393964323731380a396431323030366533353831396665
64616536323334323538313462376666616531313062623564333631396632666463336634383838
6136363131393137620a623230613131363236386631386333336163623938363131643632393036
6432
````

Para podermos acessar o seu conteúdo, utilizaremos a opção `view` e para editar a opção `edit` do `ansible-vault`:

````
ansible-vault view <arquivo>
ansible-vault edit <arquivo>
````

Agora um processo bastante comum é a criptografia do arquivo de variável do Ansible, dessa forma, para criptografarmos um arquivo já existente basta seguirmos com a opção `encrypt`:

````
ansible-vault encrypt <arquivo>
````

Para executar uma playbook que esteja utiliza um arquivo ou variável criptografada é necessário passar o comando da seguinte formar:

````
ansible-playbook --ask-vault-pass <playbook>
OU
ansible-playbook --vault-password-file <arquivo_de_senha> <playbook>
````

Finalizando, percebemos que o Ansible Vault é perfeito para proteger informações e implementar o básico de segurança de forma simples.




package br.edu.ifs.projetowebi.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

    @Entity // Marca a classe como uma tabela do banco de dados
    @Table(name = "clientes") // Define o nome da tabela no PostgreSQL
    public class Cliente {

        @Id // Define 'id' como chave primária
        // Configura a geração automática de valor para o ID pelo banco (identity)
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        private String nome;

        private String email;

        // Construtor padrão (obrigatório para JPA)
        public Cliente() {}

        // Construtor com campos (opcional)
        public Cliente(String nome, String email) {
            this.nome = nome;
            this.email = email;
        }

        // --- Getters e Setters ---
        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getNome() {
            return nome;
        }

        public void setNome(String nome) {
            this.nome = nome;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }
    }


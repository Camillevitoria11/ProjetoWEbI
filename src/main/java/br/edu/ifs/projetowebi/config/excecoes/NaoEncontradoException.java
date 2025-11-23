package br.edu.ifs.projetowebi.config.excecoes;

public class  NaoEncontradoException extends RuntimeException {
    public NaoEncontradoException(String mensagem) {
        super(mensagem);
    }
}

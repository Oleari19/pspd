import { useState } from "react";
import "./App.css";

// constante auxiliar 
const QUESTOES = [
  {
    id: 1,
    texto: "Texto questão aleatorio so pra saber como que fica aqui a posição se for um texto maior aajdbj jdjbs jfnekjedb",
    alternativas: ["1. ooooooooooooooooooooooo bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb", "2", "3", "4"],
    indiceResposta: 1,
    explicacao: "explicação",
  },
  {
    id: 2,
    texto: "Texto questão",
    alternativas: ["5", "jdien jfnkjn hfkjnkjdf jhf jeonfkj jnkjsd dddbnvjk njkc jnjkddn njkcnk jndjkfn jdckjn", "3", "4"],
    indiceResposta: 1,
    explicacao: "explicação",
  },
  {
    id: 3,
    texto: "Texto questão",
    alternativas: ["6", "2", "3", "4"],
    indiceResposta: 1,
    explicacao: "explicação",
  }];

function Alternativa({ rotulo, texto, selecionada, estado, desabilitada, aoClicar }) {
  return (
    <button
      className={[
        "alternativas",
        selecionada ? "selecionada" : "",
        estado === "correta" ? "correta" : "",
        estado === "errada" ? "errada" : "",
      ].join(" ")}
      onClick={aoClicar}
      disabled={desabilitada}
    >
      <span className="option-label">{rotulo}.</span>
      <span className="option-text">{texto}</span>
    </button>
  );
}

export default function Quiz() {
  const [iniciado, setIniciado] = useState(false);
  const [etapa, definirEtapa] = useState(0);
  const [selecionada, definirSelecionada] = useState(null);
  const [respostas, definirRespostas] = useState([]);
  const [mostrarResposta, definirMostrarResposta] = useState(false);

  const total = QUESTOES.length;
  const questao = QUESTOES[etapa];
  const progresso = Math.round((etapa / total) * 100);
  const pontuacao = respostas.filter((r) => r.correta).length;

  const Confirmar = () => {
    if (selecionada === null) return;
    const correta = selecionada === questao.indiceResposta;
    definirRespostas((prev) => [...prev, { idQuestao: questao.id, correta }]);
    definirMostrarResposta(true);
  };

  const Proxima = () => {
    definirMostrarResposta(false);
    definirSelecionada(null);
    definirEtapa((e) => e + 1);
  };

const Reiniciar = () => {
  setIniciado(false); // <- precisa garantir que isso está presente!
  definirEtapa(0);
  definirSelecionada(null);
  definirRespostas([]);
  definirMostrarResposta(false);
};

  if (!iniciado) {
    return (
      <div className="tela">
        <section className="cartao-inicial">
          <h1 className="titulo-inicial">Bem-vindo ao quiz de PSPD!</h1>
          <p className="texto-inicial">Teste seus conhecimentos sobre PSPD.</p>
          <button className="btn-reiniciar" onClick={() => setIniciado(true)}>Começar quiz</button>
        </section>
      </div>
    );
  }

  if (etapa >= total) {
    return (
      <div className="tela">
        <section className="cartao-inicial">
          <h1 className="titulo-cartao">Resultado</h1>
          <p className="progresso-cartao">
            Você acertou <b>{pontuacao}</b> de <b>{total}</b> perguntas 🎉
          </p>
          <button className="btn-reiniciar" onClick={Reiniciar}>Refazer quiz</button>
        </section>
      </div>
    );
  }

  return (
    <main className="tela">
      <section className="cartao">
        <header className="quiz-head">
          <div className="quiz-step">
            <strong>Pergunta {etapa + 1}</strong> / {total}
          </div>
          <div className="progresso-quiz">{progresso}% concluído</div>
        </header>

        <h2 className="questao-quiz">{questao.texto}</h2>

        <div className="opcoes">
          {questao.alternativas.map((alt, idx) => {
            const estaSelecionada = selecionada === idx;
            const estaCorreta = mostrarResposta && idx === questao.indiceResposta;
            const estaErrada = mostrarResposta && estaSelecionada && idx !== questao.indiceResposta;

            return (
              <Alternativa
                key={idx}
                rotulo={String.fromCharCode(65 + idx)}
                texto={alt}
                selecionada={estaSelecionada}
                estado={estaCorreta ? "correta" : estaErrada ? "errada" : undefined}
                desabilitada={mostrarResposta}
                aoClicar={() => !mostrarResposta && definirSelecionada(idx)}
              />
            );
          })}
        </div>

        {!mostrarResposta ? (
          <div className="botoes">
            <button
              className="btn-reiniciar"
              style={{ opacity: selecionada === null ? 0.6 : 1 }}
              disabled={selecionada === null}
              onClick={Confirmar}
            >
              Confirmar
            </button>
            <button className="btn-reiniciar" onClick={Reiniciar}>
              Reiniciar
            </button>
          </div>
        ) : (
          <div className="feedback">
            {selecionada === questao.indiceResposta ? (
              <h2 className="acerto">Parabéns, você acertou!</h2>
            ) : (
              <h2 className="erro">Você errou!</h2>
            )}
            <div className="explicacao-quiz">
              <h3>Explicação:</h3>
              <p className="conteudo-feedback">{questao.explicacao}</p>
            </div>
            <button className="btn-reiniciar" onClick={Proxima}>Próxima pergunta</button>
          </div>
        )}
      </section>
    </main>
  );
}

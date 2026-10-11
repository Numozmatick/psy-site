'use client';
import { useEffect, useRef, useState } from 'react';
import { burnoutQuiz as copy } from '@/content/burnout-quiz';
import { track } from '@/js/analytics';
export function BurnoutQuiz() {
  const [step, setStep] = useState(-1);
  const [answers, setAnswers] = useState([]);
  const heading = useRef(null);
  const total = copy.questions.length;
  useEffect(() => { if (step >= 0) heading.current?.focus(); }, [step]);
  const complete = step === total;
  const frequent = copy.questions.filter((_, index) => answers[index] >= 3);
  function start() { setAnswers([]); setStep(0); track('quiz_start'); }
  function next() { if (answers[step] == null) return; if (step === total - 1) track('quiz_complete'); setStep(step + 1); }
  return <section id="burnout-test" className="section shell" aria-labelledby="quiz-title">
    <div className="quiz-card ym-hide-content"><h2 id="quiz-title">{copy.title}</h2><p className="note">{copy.disclaimer}</p>
      {step === -1 ? <><p>{copy.intro}</p><p className="note">{copy.privacy}</p><button className="button" onClick={start}>{copy.start}</button></> : complete ? <>
        <h3 ref={heading} tabIndex={-1}>{copy.resultTitle}</h3><p>{copy.resultIntro}</p>
        {frequent.length ? <ul>{frequent.map(q => <li key={q}>{q}</li>)}</ul> : <p>{copy.empty}</p>}
        <p>{copy.advice}</p><div className="actions"><a className="button" href="#contact" onClick={() => track('quiz_booking_click')}>{copy.cta}</a><button className="button secondary" onClick={start}>{copy.restart}</button></div>
      </> : <>
        <p className="note" aria-live="polite">{copy.progress} {step + 1} {copy.of} {total}</p>
        <progress value={step + 1} max={total} aria-label={copy.progress} />
        <h3 ref={heading} tabIndex={-1} id="quiz-question">{copy.questions[step]}</h3>
        <fieldset className="quiz-options" aria-labelledby="quiz-question"><legend className="quiz-visually-hidden">{copy.questions[step]}</legend>{copy.options.map((option, value) => <label key={value}><input type="radio" name={'quiz-answer-' + step} checked={answers[step] === value} onChange={() => setAnswers(current => { const updated = [...current]; updated[step] = value; return updated; })} />{option}</label>)}</fieldset>
        <div className="actions"><button className="button secondary" disabled={step === 0} onClick={() => setStep(step - 1)}>{copy.back}</button><button className="button" disabled={answers[step] == null} onClick={next}>{step === total - 1 ? copy.finish : copy.next}</button></div>
      </>}
      <p className="note quiz-source"><a href={copy.sourceUrl} target="_blank" rel="noreferrer">{copy.sourceLabel}</a></p>
    </div>
  </section>;
}

import type { FC, ReactElement } from 'react';
import { isValidElement, type ReactNode } from 'react';

interface IRenderedElement {
  type: string | symbol;
  props: object;
  children: (IRenderedElement | any)[];
}

type RenderedElementNode = IRenderedElement | any | IRenderedElement[] | any[];

function renderReactElementImpl(
  element: ReactNode,
  root: RenderedElementNode,
  map: Record<string, FC> = {},
) {
  if (element === undefined || element === null || element === false) {
    return;
  }

  if (Array.isArray(element)) {
    element.forEach((child) => renderReactElementImpl(child, root, map));
    return;
  }

  if (!isValidElement(element)) {
    root.push(element);
    return;
  }

  if (typeof element.type === 'function') {
    const result = element.type(element.props);
    renderReactElementImpl(result, root, map);
    return;
  }

  if (Object.hasOwn(map, element.type)) {
    const result = map[element.type](element.props);
    renderReactElementImpl(result, root, map);
    return;
  }

  const children = renderReactElement(element.props.children, map);
  root.push({ type: element.type, props: element.props, children });
}

function renderReactElement(
  element: ReactNode,
  map: Record<string, FC> = {},
): (IRenderedElement | any)[] {
  const container = [];
  renderReactElementImpl(element, container, map);

  return container;
}

function renderToString(element: IRenderedElement | any) {
  if (typeof element !== 'object') {
    return element.toString();
  }

  if (!element.children?.length) {
    return '';
  }

  return element.children.map((child) => renderToString(child)).join('');
}

function renderBody(element: ReactElement) {
  const container = renderReactElement(element);
  return container.map((child) => renderToString(child)).join('');
}

function renderKeyboard(element: ReactNode, props) {
  const rows = [];

  const processRow = (element: ReactNode) => {
    const row = [];
    renderReactElement(element, {
      'h-keyboard-button': ({ children, payload }) => {
        const label = renderToString(children);
        row.push({ label, payload });
        return null;
      },
    });

    if (!row.length) {
      return;
    }

    rows.push(row);
    return null;
  };

  renderReactElement(element, {
    'h-keyboard-row': ({ children }) => processRow(children),
  });

  if (!rows.length) {
    return null;
  }

  return rows;

  // return {
  //  mode: props.mode,
  //  rows,
  // };
}

export default function renderReact(element: ReactNode) {
  if (!isValidElement(element)) {
    return { text: element.toString() };
  }

  let text = null;
  let keyboard = null;

  const renderedContainer = renderReactElement(element, {
    'h-body': ({ children }) => {
      text = renderBody(children);
      return null;
    },
    'h-keyboard': ({ children, ...props }) => {
      keyboard = renderKeyboard(children, props);
      return null;
    },
  });

  if (text === null) {
    text = renderBody(renderedContainer);
  }

  return { text, keyboard };
}

import { SEPARATOR } from "./const/const.js";

export function parseJsonFromMarkdown(text) {
  console.log('PARSING TEXT', text)
  // Регулярное выражение для поиска JSON в markdown-блоках кода
  const regex = /```(?:json)?\s*({[\s\S]*?}|\[[\s\S]*?\])\s*```/;
  const match = text.match(regex);
  
  if (!match) {
    // ищем объект перед сепаратором
    const beforeSeparator = text.split('===')[0]
    if(isJson(beforeSeparator)) {
      return { json: JSON.parse(beforeSeparator), content: text.replace(beforeSeparator, '') }
    }
    return { json: null, content: text };
  }
  
  try {
    // Извлекаем JSON из найденного блока
    const jsonString = match[1].trim();
    const json = JSON.parse(jsonString);
    console.log("GOT JSON", json)
    
    // Удаляем блок JSON из исходной строки
    const content = text.replace(match[0], '');
    
    return { json, content };
  } catch (error) {
    // Ошибка парсинга JSON
    console.error('Ошибка при парсинге JSON:', error);
    return { 
      json: null,
      content: text.replaceAll(SEPARATOR, '') 
    };
  }
} 

export function isValidDiagram(diagramData) {
  if(!diagramData) {
    return false
  }
  if(!Array.isArray(diagramData)) {
    return false
  }
  if(diagramData.length === 0) {
    return false
  }
  if(!diagramData[0].data || !diagramData[0].id || !diagramData[0].type) {
    return false
  }
  return true
}

// Функция для удаления Markdown-обертки
export function removeMdWrapper(content) {
  // Проверяем есть ли Markdown-разметка для JSON (```json{content}```)
  const jsonMdPattern = /```json\s*([\s\S]*?)(\s*```|$)/;
  const mdPattern = /```\s*([\s\S]*?)\s*```/;
  
  let match = content.match(jsonMdPattern);
  if (match) {
    return match[1].trim();
  }
  
  match = content.match(mdPattern);
  if (match) {
    return match[1].trim();
  }
  
  return content;
}

export function isJson(content) {
  try {
    JSON.parse(content)
    return true
  } catch (e) {
    return false
  }
}

export function getFormattedResponse({data, errors = []}) {
  return {
    data,
    errors
  }
}
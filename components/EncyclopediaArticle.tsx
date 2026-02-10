import React from 'react';

interface Props {
  title: string;
  content: string;
}

const EncyclopediaArticle: React.FC<Props> = ({ title, content }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden h-full flex flex-col animate-fadeIn">
      <div className="bg-stone-50 border-b border-stone-100 p-6 md:p-8">
        <h2 className="text-3xl font-bold font-serif text-red-900 mb-2">{title}</h2>
        <div className="h-1 w-20 bg-amber-500 rounded-full"></div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 md:p-10 font-serif text-stone-700 leading-loose">
        <article 
          className="prose prose-stone prose-lg max-w-none prose-headings:font-serif prose-headings:text-stone-800 prose-p:text-justify prose-a:text-red-700 hover:prose-a:text-red-800 prose-li:marker:text-amber-600"
          dangerouslySetInnerHTML={{ __html: content }}
        />
        
        <div className="mt-12 pt-8 border-t border-stone-100 text-center text-sm text-stone-400 italic">
          此內容僅供命理學術研究參考，請勿過度迷信。
        </div>
      </div>
    </div>
  );
};

export default EncyclopediaArticle;
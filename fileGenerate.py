import subprocess
import json
from flask import Flask, request, jsonify
#from pdf2image import convert_from_path

app = Flask('app')



def generate_latex_content(data,margin,section,line): #margin size horizontally - section is how many colomns to divide the page into
    print(data)
    
    latex_content_format1 = r"""
        \documentclass[10pt]{article}
        \usepackage{amsmath}  % For advanced math features
        \usepackage{amsfonts} % For math fonts
        \usepackage{amssymb}  % For extra symbols
        \usepackage{geometry} % To adjust page margins
        \usepackage{multicol} % For multi-column layout
        \usepackage{parskip}  % Removes extra space between paragraphs
        \usepackage{titlesec} % For customizing section and subsection styles
        \usepackage{enumitem} % Package for customizing lists

        % Adjust page margins to minimize wasted space
        """
    latex_content_format1 += "\geometry{top=0.3in, bottom=0.3in,"+ f"left={margin}in, right={margin}in" + "}"
    latex_content_format1 += r"""
        % Set the page style to have no page numbers
        \pagestyle{empty}

        % Reduces the space between equations
        \setlength{\jot}{1pt}

        % Customize section and subsection formatting
        \titleformat{\subsection}[runin]{\normalfont\bfseries\small}{\thesubsection}{1em}{}

        % Adjust column balancing and space
        \setlength{\columnsep}{3pt}  % Controls the space between columns
    """
    latex_content_format1 += r"""\setlength{\columnseprule}{""" + str(line) + r"""pt}  % Remove the line between columns    
        \renewcommand{\labelitemi}{\tiny$\bullet$}
        % Adjust the space between bullet and text
        \setlist[itemize]{labelsep=1pt}  % Controls space between the bullet and the text
        \setlist[itemize,1]{left=0.5pt}    % Controls indentation of bullet points
        \begin{document}
        """
    latex_content_format1 += r"\begin{multicols*}" + f"{{{section}}}  % Start three-column layout\n"

    latex_content_format1 += f"\section*{{{data['title']}}}"

    for topic in data['topics']:
        print(topic)
        if topic != "Uncategorized":
            latex_content_format1 += f"\subsection*{{{topic}}}\n"
        latex_content_format1 += r"""\begin{itemize}\footnotesize
        """
        for equation in data['topics'][topic]:
            latex_content_format1 += f"\item ${equation[0]}$\n"
            if len(equation) == 2:
                latex_content_format1 += f"\item[] {equation[1]}\n"
        latex_content_format1 += r"""\end{itemize}
        """
    latex_content_format1 += r"""
    \end{multicols*}
    \end{document}
    """
    return latex_content_format1

# Write to a .tex file
#if __name__ == "__main__":


@app.route('/run-program', methods=['POST'])
def run_program():
    with open("test_input.json", "r") as file:
        data = json.load(file)  # Converts JSON to a Python dictionary
    with open('formula_sheet.tex', 'w') as file:
        file.write(generate_latex_content(data,0.5,3,0))
    subprocess.run(["pdflatex", "formula_sheet.tex"])
    return jsonify({"message": "JSON file loaded and compiled to pdf successfully!"})


import openai
import json
import pandas as pd
import os
from langchain.llms import OpenAI
from dotenv import load_dotenv
from langchain.agents import create_csv_agent
import langchain
import itertools
from pprint import pprint
import ast
from collections import defaultdict
langchain.verbose = False

def set_api_key():
    load_dotenv()
    if os.getenv("OPENAI_API_KEY") is None or os.getenv("OPENAI_API_KEY") == "":
            print("OPENAI_API_KEY is not set")
            exit(1)
    else:
        openai.api_key = os.getenv("OPENAI_API_KEY")

def remove_value(input_list, value_to_remove):
    return [item for item in input_list if item != value_to_remove]

def flatten_unique(input_list):
    unique_elements = set()
    result = []

    for sublist in input_list:
        for element in sublist:
            if element not in unique_elements:
                unique_elements.add(element)
                result.append(element)

    return result

def calculate_for_pie(graph):
    if 'pie' in graph:
        for gr in graph['pie']:
            sums = {}
            for i in range(len(gr['cl_values'][0])):
                key = gr['cl_values'][0][i]
                value = gr['cl_values'][1][i]
                if key in sums:
                    sums[key] += value
                else:
                    sums[key] = value
            categories = []
            values = []
            for key, total in sums.items():
                categories.append(key)
                values.append(total)
    
        graph['pie'][0]['cl_values'] = [categories,values]
    return graph

class ChatPet:
    # Initialize the default settings
    def __init__(self):
        set_api_key()
        
        # self.chat_id = chat_id
        # self.chat_title = "Conversation"+str(chat_id)
        self.functions = [
                {
                    "name": "get_coloumn_info",
                    "description": "Get the coloumn type and unit",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "coloumn_type": {
                                "type": "string",
                                "description": "The type of the coloumn",
                                "enum": ["categorical", "numerical", "temporal"]
                            },
                            "coloumn_unit": {
                                "type": "string",
                                "description": "The unit of the coloumn. If coloumn values contains decimals, it is ratio ",
                                "enum": ["number", "percentage", "currency", "ratio"]
                            }
                        },
                        "required": ["coloumn_type", "coloumn_unit"],
                    },
                }
            ]
        
    
    # Reads the data table, and send to llm agent
    def read_data(self, csv_file_path):
        self.df = pd.read_csv(csv_file_path)
        self.generate_config()
        self.csv_file = open(csv_file_path)
        self.agent = create_csv_agent(OpenAI(temperature=0), self.csv_file, verbose=False)

    # Parses through the config provided by LLM, Corrects format
    def get_coloumn_info(self, coloumn_type, coloumn_unit):
        if coloumn_type == "numerical":
            coloumn_info = {
                'type' : coloumn_type,
                'unit' : coloumn_unit
            }
        else:
            coloumn_info = {
                'type' : coloumn_type,
                'unit' : ''
            }
        return json.dumps(coloumn_info)
    
    # Calls LLM to generate config
    def generate_config(self):
        data_config = {}
        initial_prompt = f"Following is the output for 'df.head()' of a pandas dataframe: {self.df.head().to_string()} \n Choose coloumn type and coloumn unit for each coloumn"
        
        for coloumn_name, coloumn_values in self.df.items():
            coloumn_values = coloumn_values[:10].tolist()
            self.messages = [{"role": "user", "content" : initial_prompt}]
            self.messages.append({"role": "user", "content": f"Is the '{coloumn_name}' column categorical, numerical, or temporal?"})
            
            response_message = self.get_initial_response()

            if response_message.get("function_call"):
                available_functions = {
                    "get_coloumn_info": self.get_coloumn_info,
                }

                function_name = response_message["function_call"]["name"]
                function_to_call = available_functions[function_name]
                function_args = json.loads(response_message["function_call"]["arguments"])
                function_response = function_to_call(
                    coloumn_type=function_args.get("coloumn_type"),
                    coloumn_unit=function_args.get("coloumn_unit"),
                )
                data_config[coloumn_name] = json.loads(function_response)        
        self.data_config = data_config
        print("data config:",data_config)
        # self.generate_graph_types()
    
    # Gets initial response as specified by the LLM function calling format
    def get_initial_response(self):

        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=self.messages,
            functions=self.functions,
            function_call={"name": "get_coloumn_info"},
        )
        response_message = response["choices"][0]["message"]
        self.messages.append(response_message)

        return response_message

    # Gets Subsquent response based on the user input text.
    # To-Do - return Charts
    def get_response(self, text):
        self.messages.append({"role": "user", "content": text})

        response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo-0613",
                messages=self.messages,
                max_tokens=100
        )
        response_message = response["choices"][0]["message"]
        self.messages.append(response_message)
        return response_message
    
    # Gets subsquent response from the langchain agent
    def get_response_lc(self, text):
        response_message = self.agent.run(text)
        graph_text = f'user_question: {text}\n chatbot_answer: {response_message} \n Return a python list of list containg the names of coloumns, using which plots can be plotted which supports chatbot_answer. for eg, [[coloumn1,coloumn2],[coloumn2,coloumn3,coloumn4]] means plot against coloumn1-coloumn2 and coloumn2,coloumn3,coloumn4 supports the chatbot_answer. Min 2 coloumns and Max 3 coloumns in a list.'
        print(response_message)
        relevant_graphs = self.agent.run(graph_text)
        relevant_graphs_list = ast.literal_eval(relevant_graphs)
        print("relevant graphs", relevant_graphs_list)
        relevant_coloumns = flatten_unique(relevant_graphs_list)
        print(relevant_coloumns)
        self.generate_graph_types(relevant_coloumns)
        graph_to_plot = {}
        types_list = ['bar', 'line', 'pie', 'bubble', 'heat_map']
        if len(relevant_coloumns)>2:
            for combo in itertools.combinations(relevant_coloumns, 3):
                for key in types_list:
                    if tuple(combo) in self.possible_graphs[key]:
                        cl_list = []
                        for cl in combo:
                            cl_list.append(self.df[cl][:10].tolist())
                        if(key == 'bubble'):  
                            graph_to_plot['heat_map']= [{'cl_names': combo, 'cl_values': cl_list}]
                            types_list = remove_value(types_list, 'heat_map')
                        graph_to_plot[key]= [{'cl_names': combo, 'cl_values': cl_list}]
                        types_list = remove_value(types_list, key)
        if len(relevant_coloumns)>1:            
            for combo in itertools.combinations(relevant_coloumns, 2):
                for key in types_list:
                    if tuple(combo) in self.possible_graphs[key]:
                        cl_list = []
                        for cl in combo:
                            cl_list.append(self.df[cl][:100].tolist())
                        if(key == 'bubble'):  
                            graph_to_plot['heat_map']= [{'cl_names': combo, 'cl_values': cl_list}]
                            types_list = remove_value(types_list, 'heat_map')
                        graph_to_plot[key]= [{'cl_names': combo, 'cl_values': cl_list}]
                        types_list = remove_value(types_list, key)


        graph_to_plot = calculate_for_pie(graph_to_plot)
        print("Total plottable Graphs: ", len(graph_to_plot), graph_to_plot)
        return response_message, graph_to_plot
        
    
    def get_config(self):
        return self.data_config
    
    def save_conversation(self):
        pass

    def modify_conversation(self):
        pass

    def cont_conversation(self, chat_id):
        pass

    def assign_chat_title(self):
        pass

    def submit_chat_feedback(self):
        pass

    def generate_graph_types(self, relevant_coloumns):

        # Initialize the dictionary for possible graph combinations
        possible_graphs = {
            'bar': set(),
            'line': set(),
            'pie': set(),
            'bubble': set(),
            'heat_map': set()
        }
        # Iterate through all pairs or triples of columns to find valid combinations
        columns = relevant_coloumns

        for graph_type in possible_graphs.keys():
            if graph_type == 'bar':
                # One Categorical + One/Multiple Numerical (of same unit)
                if(len(columns)>1):
                    for combo in itertools.combinations(columns, 2):
                        col1, col2 = combo
                        if self.data_config[col1]['type'] == 'categorical' and self.data_config[col2]['type'] == 'numerical':
                            possible_graphs[graph_type].add(combo)
                if(len(columns)>2):
                    for combo in itertools.combinations(columns, 3):
                        col1, col2, col3 = combo
                        if self.data_config[col1]['type'] == 'categorical' and self.data_config[col2]['type'] == 'numerical' and self.data_config[col3]['type'] == 'numerical':
                            possible_graphs[graph_type].add((col1, col2, col3))
            elif graph_type == 'line':
                # One Temporal + One/Multiple Numerical (of same unit)
                if(len(columns)>1):
                    for combo in itertools.combinations(columns, 2):
                        col1, col2 = combo
                        if self.data_config[col1]['type'] == 'temporal' and self.data_config[col2]['type'] == 'numerical':
                            possible_graphs[graph_type].add(combo)
                if(len(columns)>2):
                    for combo in itertools.combinations(columns, 3):
                        col1, col2, col3 = combo
                        if self.data_config[col1]['type'] == 'categorical' and self.data_config[col2]['type'] == 'numerical' and self.data_config[col3]['type'] == 'numerical':
                            possible_graphs[graph_type].add((col1, col2, col3))
            elif graph_type == 'pie':
                # One Categorical + One Numerical
                if(len(columns)>1):
                    for col1, col2 in itertools.permutations(columns, 2):
                        if self.data_config[col1]['type'] == 'categorical' and self.data_config[col2]['type'] == 'numerical':
                            possible_graphs[graph_type].add((col1, col2))
            elif graph_type == 'bubble':
                # One Categorical + One/Two Numerical
                # for combo in itertools.combinations(columns, 3):
                #     col1, col2, col3 = combo
                #     if self.data_config[col1]['type'] == 'categorical' and self.data_config[col2]['type'] == 'numerical':
                #         possible_graphs[graph_type].add((col1, col2))
                    
                # Two Categorical + One Numerical
                # for combo in itertools.combinations(columns, 3):
                #     col1, col2, col3 = combo
                #     if self.data_config[col1]['type'] == 'categorical' and self.data_config[col2]['type'] == 'categorical' and self.data_config[col3]['type'] == 'numerical':
                #         possible_graphs[graph_type].add((col1, col2, col3))
                # Two Numerical
                if(len(columns)>1):
                    for combo in itertools.combinations(columns, 2):
                        col1, col2 = combo
                        if self.data_config[col1]['type'] == 'numerical' and self.data_config[col2]['type'] == 'numerical':
                            possible_graphs[graph_type].add((col1, col2))
                if(len(columns)>2):
                    # Three Numerical
                    for combo in itertools.combinations(columns, 3):
                        col1, col2, col3 = combo
                        if self.data_config[col1]['type'] == 'numerical' and self.data_config[col2]['type'] == 'numerical' and self.data_config[col3]['type'] == 'numerical':
                            possible_graphs[graph_type].add((col1, col2, col3))


        # Print the possible graph combinations
        self.possible_graphs = possible_graphs
        print("Possibel Graphs: ",possible_graphs)




# C1 = ChatPet()
# C1.generate_graph_types(['Spends', 'Clicks', 'Cpc', 'Cvr'])
# print(C1.read_data('../data/revenue.csv'))
# print(C1.get_config())
# # print(C1.get_response_lc("Perform a deep dive analysis to identify the underlying reasons for the observed dips in BOB CAC for September month considering all factors such as Campaign Type, Ad Platform, Spends, Clicks, CPC, Platform Conversion, Deviation, and Conversion Rate."))
# print(C1.get_response_lc("How have revenue changed over the past few quarters?"))

# print(C1.get_response_lc("What is the campaign ID for Sponsored Products"))
from ollama import chat
from ollama import ChatResponse

print("Post Pioneer Deepseek Test")
initial_prompt = "Provide the content body for a social media post"
model = "deepseek-r1:1.5b"
messages = [{"role": "system", "content": initial_prompt}];
response= chat(model=model, messages=messages)
messages.append({"role": "assistant", "content": response['message']['content']})
print(response['message']['content'])
while(True):
        user_input = input("\nWrite your input: ")
        messages.append({"role": "user", "content": user_input})
        response= chat(model=model, messages=messages)
        messages.append({"role": "assistant", "content": response['message']['content']})
        print(response['message']['content'])
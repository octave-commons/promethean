Creating templates is a powerful way to streamline your note creation process and maintain consistency. In this section, we'll walk you through the steps to create effective templates.

The [Template Playground](https://docs.text-gen.com/_notes/2-+Options/Tools/Template+Playground) is a dynamic environment designed to enhance your understanding and proficiency with templates. It serves as a practical learning center where you can explore, experiment, and craft templates in real-time.

## Selecting the Starting Point for Your Template

To begin, you have multiple starting points:

1. **From Active Document**
    
    - Execute the command [Create a Template](https://docs.text-gen.com/_notes/old/templates/Create+a+Template) from your active document to start the template creation process.
2. **From Template Playground**
    
    - Using [Template Playground](https://docs.text-gen.com/_notes/2-+Options/Tools/Template+Playground), it is possible to test the template engine in a more practical way and create templates from there.
3. **From Scratch**
    
    - **Create** a file within the **Templates Folder**.
    - **Add** the template metadata by inserting [Template Metadata](https://docs.text-gen.com/_notes/3-+Templates/subpages/Template+Metadata) at the beginning of your file.

## Understanding Template Structure

Templates consist of four integral parts: Metadata, Initialization, Prompt, and Output. Each section plays a pivotal role in data handling and final presentation.  
![02 Template Creation 2023-11-03 09.21.02.svg](https://publish-01.obsidian.md/access/9b4703d86ab4cd591fba430c20daa539/assets/images/02%20Template%20Creation%202023-11-03%2009.21.02.svg)

### Metadata

- The metadata section contains essential information regarding the template, such as `promptId`, `name`, and a comprehensive description. Further details are available in [Template Metadata](https://docs.text-gen.com/_notes/3-+Templates/subpages/Template+Metadata).

![Pasted image 20231104190506.png](https://publish-01.obsidian.md/access/9b4703d86ab4cd591fba430c20daa539/assets/images/Pasted%20image%2020231104190506.png)

### Initialization (Optional)

This section will not be included in the template's prompt and can be used to:

- **Gather** and **prepare** any required data before the main logic of the template is executed in the `prompt` section.
- **Declare** variables that will be used in later sections.
- **Define** [Custom Form](https://docs.text-gen.com/_notes/3-+Templates/subpages/Custom+Form) for better customization.
- **Enhance** readability by using code blocks, such as:  
    ![Pasted image 20231105113334.png](https://publish-01.obsidian.md/access/9b4703d86ab4cd591fba430c20daa539/assets/images/Pasted%20image%2020231105113334.png)

### Prompt

- This section is processed by the chosen **Language Learning Model (LLM)** unless `disabledProvider` is set to `false`.
- **Extract** data, **manipulate** the information, and **perform** conditions and loops using handlebar syntax or **JavaScript** inside `script` block along with provided helper functions.

### Output (Optional)

- **Format** and **present** the results from the selected LLM (if enabled) in the `{{output}}`.
- **Insert** the resulting data into the correct placeholders within the output template.

The **body** of template can have just the **prompt** section without any `***`. With one `***`, the first part will be `prompt` and the second part will be `output`.

## Writing Templates

The core of the template functionality is powered by [Handlebars](https://handlebarsjs.com/). There are two primary methods for template creation:

- **[Handlebar Templates](https://docs.text-gen.com/_notes/3-+Templates/subpages/Handlebar+Templates)**
    - Utilize handlebar logic alongside additional helper functions for asynchronous processing and manipulation of data.
- **[Javascript Templates](https://docs.text-gen.com/_notes/3-+Templates/subpages/Javascript+Templates)**
    - Integrate JavaScript within handlebars using the `script` helper function for advanced scripting capabilities. Ensure that scripts come from a trusted source to mitigate security risks.

## Additional Resources

- [Handlebars Documentation](https://handlebarsjs.com/)
- [JavaScript Documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

## Conclusion

Creating effective templates can significantly improve your document creation process. By following the steps outlined in this guide, you'll be able to create templates that streamline your workflow and ensure consistency in your documents.
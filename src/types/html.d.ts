
interface HTMLInputElement {
  webkitdirectory?: string;
  directory?: string;
}

// Extend the InputHTMLAttributes interface to include our custom attributes
interface CustomInputHTMLAttributes extends React.InputHTMLAttributes<HTMLInputElement> {
  webkitdirectory?: string;
  directory?: string;
}

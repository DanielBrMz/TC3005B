import { Link } from "react-router-dom";
import { BreadcrumbsProps } from "../types/breadcrumbs.ts";

export const Breadcrumbs = ({ entries }: BreadcrumbsProps) => {
  const pathNames = entries?.map((entry) => ({
    name: entry.name,
    path: entry.path,
  }));
  return (
    <div className="breadcrumbs">
      <Link to="/">Home</Link>
      {pathNames?.map(({ name, path }, index) => {
        const isLast = index === pathNames?.length - 1;
        return isLast ? (
          <span key={name}> / {name}</span>
        ) : (
          <span key={name}>
            {" "}
            / <Link to={path}>{name}</Link>
          </span>
        );
      })}
    </div>
  );
};

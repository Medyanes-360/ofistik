'use client'
import {usePathname, useRouter} from "next/navigation";
import {useState} from "react";
import classNames from "classnames";
import NavigationButton from "@/containers/dashboard/_components/NavigationButton";
import {isRole} from "@/lib/useAuth"
import {AnimatePresence, motion} from "framer-motion";

const ButtonList = ({ buttons, level = 0, child = false }) => {
    const pathname = usePathname()
    const router = useRouter();
    const [expanded, setExpanded] = useState({});

    const onExpand = (path) => {
        setExpanded(prevExpanded => ({
            ...prevExpanded,
            [path]: !prevExpanded[path]
        }));
    };

    const onRedirect = (path) => {
        router.push(path);
    };

    return  <>
        {buttons
            .filter(button => isRole(button.role))
            .map((button) => (
            <div key={button.id} className={
                classNames(
                    "flex flex-col gap-1",
                    level !== 1 && `pl-8`
                )
            }>
                <NavigationButton
                    child={child}
                    id={button.id}
                    onClick={() => onRedirect(button.path)}
                    label={button.label}
                    icon={button.icon || null}
                    active={pathname === button.path}
                    level={level}
                    onExpand={() => onExpand(button.path)}
                    expanded={expanded[button.path]}
                    isChilds={button?.childs && button?.childs?.length > 0}
                />
                <AnimatePresence>
                {expanded[button.path] && (
                    <motion.div
                        key={button.path}
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        exit={{ height: 0 }}
                        className="flex flex-col gap-1 overflow-hidden"
                    >
                    <ButtonList
                        child={true}
                        buttons={button.childs}
                        level={level + 1}
                    />
                </motion.div>
                )}
                    </AnimatePresence>
            </div>
        ))}
    </>
}

export default ButtonList
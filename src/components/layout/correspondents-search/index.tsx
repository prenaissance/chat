import {
  Box,
  Input,
  InputGroup,
  InputLeftElement,
  useColorModeValue,
  useOutsideClick,
} from "@chakra-ui/react";
import { useState, useCallback, type ChangeEvent, useRef } from "react";
import { api } from "~/utils/api";
import SearchResults from "./SearchResults";
import { SearchIcon } from "@chakra-ui/icons";

const CorrespondentsSearch = () => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const bgColor = useColorModeValue("gray.300", "gray.900");
  const borderColor = useColorModeValue("gray.400", "gray.600");
  const correspondentsQuery = api.correspondents.search.useQuery(
    {
      query,
    },
    {
      enabled: !!isOpen && query.length > 0,
    }
  );

  const handleFocus = useCallback(() => setIsOpen(true), []);
  const handleClose = useCallback(() => setIsOpen(false), []);
  useOutsideClick({
    ref,
    handler: (e) => {
      if (e.target instanceof HTMLElement) {
        if (e.target.closest("[data-ignore-outside-click]")) {
          return;
        }
      }
      handleClose();
    },
  });
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => setQuery(e.target.value),
    []
  );

  return (
    <Box position="relative" ref={ref}>
      <InputGroup>
        <Input
          size="sm"
          variant="filled"
          placeholder="Search for a correspondent"
          onFocus={handleFocus}
          onChange={handleChange}
        />
        <InputLeftElement pointerEvents="none">
          <SearchIcon />
        </InputLeftElement>
      </InputGroup>
      <Box
        role="listbox"
        position="absolute"
        top="100%"
        w="100%"
        aria-expanded={isOpen}
      >
        {isOpen && (
          <SearchResults
            zIndex="dropdown"
            borderX="1px solid"
            borderBottom="1px solid"
            roundedBottom="sm"
            borderColor={borderColor}
            bgColor={bgColor}
            p={2}
            query={query}
            isLoading={correspondentsQuery.isLoading}
            users={correspondentsQuery.data?.users ?? []}
            groups={correspondentsQuery.data?.groups ?? []}
          />
        )}
      </Box>
    </Box>
  );
};

export default CorrespondentsSearch;

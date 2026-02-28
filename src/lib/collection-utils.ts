type SortableFields = {
  sortOrder: number;
  title: string;
};

type SortableCollectionEntry = {
  data: SortableFields;
};

export const sortBySortOrderThenTitle = <T extends SortableFields>(
  left: T,
  right: T,
) =>
  left.sortOrder - right.sortOrder || left.title.localeCompare(right.title);

export const sortCollectionEntriesBySortOrderThenTitle = <
  T extends SortableCollectionEntry,
>(
  left: T,
  right: T,
) => sortBySortOrderThenTitle(left.data, right.data);

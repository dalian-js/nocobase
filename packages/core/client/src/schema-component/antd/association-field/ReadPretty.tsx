import { observer } from '@formily/react';
import React from 'react';
import { AssociationFieldProvider } from './AssociationFieldProvider';
import { FileManageReadPretty } from './FileManager';
import { InternalNester } from './InternalNester';
import { InternalSubTable } from './InternalSubTable';
import { ReadPrettyInternalTag } from './InternalTag';
import { ReadPrettyInternalViewer } from './InternalViewer';
import { useAssociationFieldContext } from './hooks';

const ReadPrettyAssociationField = observer(
  (props: any) => {
    const { currentMode } = useAssociationFieldContext();
    return (
      <>
        {['Select', 'Picker', 'CascadeSelect'].includes(currentMode) && <ReadPrettyInternalViewer {...props} />}
        {currentMode === 'Tag' && <ReadPrettyInternalTag {...props} />}
        {currentMode === 'Nester' && <InternalNester {...props} />}
        {currentMode === 'SubTable' && <InternalSubTable {...props} />}
        {currentMode === 'FileManager' && <FileManageReadPretty {...props} />}
      </>
    );
  },
  { displayName: 'ReadPrettyAssociationField' },
);

export const ReadPretty = observer(
  (props) => {
    return (
      <AssociationFieldProvider>
        <ReadPrettyAssociationField {...props} />
      </AssociationFieldProvider>
    );
  },
  { displayName: 'ReadPretty' },
);

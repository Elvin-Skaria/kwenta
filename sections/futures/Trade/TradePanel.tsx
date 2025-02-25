import { FC, memo, useCallback, useState, useEffect } from 'react';
import styled from 'styled-components';

import Error from 'components/ErrorView';
import Spacer from 'components/Spacer';
import { PositionSide } from 'sdk/types/futures';
import { selectAckedOrdersWarning } from 'state/app/selectors';
import { changeLeverageSide } from 'state/futures/actions';
import { setOrderType } from 'state/futures/reducer';
import { selectFuturesType, selectLeverageSide, selectOrderType } from 'state/futures/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { selectPricesConnectionError } from 'state/prices/selectors';

import TradePanelFeeInfo from '../FeeInfoBox/TradePanelFeeInfo';
import LeverageInput from '../LeverageInput';
import MarginInput from '../MarginInput';
import OrderSizing from '../OrderSizing';
import PositionButtons from '../PositionButtons';
import CloseOnlyPrompt from './CloseOnlyPrompt';
import ManagePosition from './ManagePosition';
import MarketsDropdown from './MarketsDropdown';
import OrderAcknowledgement from './OrderAcknowledgement';
import OrderTypeSelector from './OrderTypeSelector';
import SLTPInputs from './SLTPInputs';
import TradeBalance from './TradeBalance';
import OrderPriceInput from './TradePanelPriceInput';

type Props = {
	mobile?: boolean;
};

const TradePanel: FC<Props> = memo(({ mobile }) => {
	const dispatch = useAppDispatch();

	const leverageSide = useAppSelector(selectLeverageSide);
	const accountType = useAppSelector(selectFuturesType);
	const orderType = useAppSelector(selectOrderType);
	const pricesConnectionError = useAppSelector(selectPricesConnectionError);
	const hideOrderWarning = useAppSelector(selectAckedOrdersWarning);

	const [showOrderWarning, setShowOrderWarning] = useState(false);

	const handleChangeSide = useCallback(
		(side: PositionSide) => {
			dispatch(changeLeverageSide(side));
		},
		[dispatch]
	);

	useEffect(() => {
		if (hideOrderWarning) return;
		if (orderType !== 'market') {
			setShowOrderWarning(true);
		} else {
			setShowOrderWarning(false);
		}
	}, [orderType, hideOrderWarning]);

	return process.env.NEXT_PUBLIC_CLOSE_ONLY === 'true' ? (
		<CloseOnlyPrompt $mobile={mobile} />
	) : (
		<TradePanelContainer $mobile={mobile}>
			<MarketsDropdown />

			{!mobile && <TradeBalance />}
			<PositionButtons selected={leverageSide} onSelect={handleChangeSide} />

			<MainPanelContent>
				{pricesConnectionError && (
					<Error message="Failed to connect to price feed. Please try disabling any ad blockers and refresh." />
				)}

				{accountType === 'cross_margin' && (
					<OrderTypeSelector orderType={orderType} setOrderTypeAction={setOrderType} />
				)}

				{showOrderWarning ? (
					<>
						<Spacer height={16} />
						<OrderAcknowledgement
							inContainer
							onClick={() => setShowOrderWarning(!showOrderWarning)}
						/>
					</>
				) : (
					<>
						{accountType === 'cross_margin' && <MarginInput />}

						{orderType !== 'market' && accountType === 'cross_margin' && (
							<>
								<OrderPriceInput />
								<Spacer height={16} />
							</>
						)}

						<OrderSizing />

						<LeverageInput />

						{accountType === 'cross_margin' && <SLTPInputs />}

						<ManagePosition />

						<TradePanelFeeInfo />
					</>
				)}
			</MainPanelContent>
		</TradePanelContainer>
	);
});

const TradePanelContainer = styled.div<{ $mobile?: boolean }>`
	overflow-y: scroll;
	height: 100%;
	scrollbar-width: none;
	border-right: ${(props) => props.theme.colors.selectedTheme.border};
`;

const MainPanelContent = styled.div`
	padding: 0 15px;
`;

export default TradePanel;

import React from "react";

import { expect } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/jest-globals";

import BotMessage from "../../src/components/ChatBotBody/BotMessage/BotMessage";
import { Message } from "../../src/types/Message";

import { TestChatBotProvider } from "../__mocks__/TestChatBotContext";

/**
 * Helper function to render BotMessage with different settings and styles.
 *
 * @param message Message object to render
 * @param isNewSender boolean indicating if this message is from a new sender
 * @param settings custom settings to override defaults
 */
const renderBotMessage = (
	message: Message,
	isNewSender: boolean = true,
	settings: any = {}
) => {
	const initialSettings = {
		general: {
			secondaryColor: "#6e48aa",
			...settings.general
		},
		botBubble: {
			showAvatar: false,
			animate: true,
			avatar: "test-bot-avatar.png",
			...settings.botBubble
		},
		...settings
	};

	const initialStyles = {
		botBubbleStyle: {},
		...settings.styles
	};

	return render(
		<TestChatBotProvider initialSettings={initialSettings} initialStyles={initialStyles}>
			<BotMessage message={message} isNewSender={isNewSender} />
		</TestChatBotProvider>
	);
};

/**
 * Test for BotMessage component.
 */
describe("BotMessage Component", () => {
	const mockStringMessage: Message = {
		id: "1",
		content: "Hello, this is a bot message",
		sender: "bot",
		type: "string",
		timestamp: new Date().toISOString()
	};

	const mockJSXMessage: Message = {
		id: "2",
		content: <div data-testid="custom-jsx-content">Custom bot content</div>,
		sender: "bot",
		type: "object",
		timestamp: new Date().toISOString()
	};

	const MockContentWrapper = ({ children }: { children: React.ReactNode }) => (
		<div data-testid="content-wrapper">{children}</div>
	);

	const mockMessageWithWrapper: Message = {
		id: "3",
		content: "Wrapped bot content",
		sender: "bot",
		type: "string",
		timestamp: new Date().toISOString(),
		contentWrapper: MockContentWrapper
	};

	it("renders string content correctly with default settings", () => {
		renderBotMessage(mockStringMessage);

		const container = document.querySelector(".rcb-bot-message-container");
		expect(container).toBeInTheDocument();
		expect(screen.getByText("Hello, this is a bot message")).toBeInTheDocument();

		const avatar = document.querySelector(".rcb-message-bot-avatar");
		expect(avatar).not.toBeInTheDocument();
	});

	it("applies correct styles for string messages", () => {
		renderBotMessage(mockStringMessage);

		const messageBubble = screen.getByText("Hello, this is a bot message").closest("div");

		expect(messageBubble).toHaveStyle({
			backgroundColor: "#6e48aa",
			color: "#fff",
			maxWidth: "70%"
		});
		expect(messageBubble).toHaveClass("rcb-bot-message");
		expect(messageBubble).toHaveClass("rcb-bot-message-entry");
	});

	it("shows avatar when showAvatar is enabled and isNewSender is true", () => {
		const settings = {
			botBubble: {
				showAvatar: true,
				avatar: "test-bot-avatar.png"
			}
		};

		renderBotMessage(mockStringMessage, true, settings);

		const avatar = document.querySelector(".rcb-message-bot-avatar");
		expect(avatar).toBeInTheDocument();
		expect(avatar).toHaveStyle({
			backgroundImage: 'url("test-bot-avatar.png")'
		});

		const messageBubble = screen.getByText("Hello, this is a bot message").closest("div");
		expect(messageBubble).toHaveStyle({
			maxWidth: "65%"
		});
	});

	it("hides avatar and offsets message when showAvatar is enabled but isNewSender is false", () => {
		const settings = {
			botBubble: {
				showAvatar: true,
				avatar: "test-bot-avatar.png"
			}
		};

		renderBotMessage(mockStringMessage, false, settings);

		const avatar = document.querySelector(".rcb-message-bot-avatar");
		expect(avatar).not.toBeInTheDocument();

		const messageBubble = screen.getByText("Hello, this is a bot message").closest("div");
		expect(messageBubble).toHaveClass("rcb-bot-message-offset");
	});

	it("disables animation when animate setting is false", () => {
		const settings = {
			botBubble: {
				animate: false
			}
		};

		renderBotMessage(mockStringMessage, true, settings);

		const messageBubble = screen.getByText("Hello, this is a bot message").closest("div");
		expect(messageBubble).not.toHaveClass("rcb-bot-message-entry");
	});

	it("renders JSX content without bot bubble wrapper", () => {
		renderBotMessage(mockJSXMessage);

		expect(screen.getByTestId("custom-jsx-content")).toBeInTheDocument();
		expect(screen.getByText("Custom bot content")).toBeInTheDocument();

		const customContent = screen.getByTestId("custom-jsx-content");
		expect(customContent).not.toHaveClass("rcb-bot-message");
	});

	it("applies content wrapper when provided", () => {
		renderBotMessage(mockMessageWithWrapper);

		const wrapper = screen.getByTestId("content-wrapper");
		expect(wrapper).toBeInTheDocument();
		expect(wrapper).toContainElement(screen.getByText("Wrapped bot content"));
	});

	it("applies custom styles from styles context", () => {
		const settings = {
			styles: {
				botBubbleStyle: {
					borderRadius: "20px",
					fontSize: "14px",
					padding: "12px"
				}
			}
		};

		renderBotMessage(mockStringMessage, true, settings);

		const messageBubble = screen.getByText("Hello, this is a bot message").closest("div");
		expect(messageBubble).toHaveStyle({
			borderRadius: "20px",
			fontSize: "14px",
			padding: "12px"
		});
	});
});

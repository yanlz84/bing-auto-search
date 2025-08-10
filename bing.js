// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.222
// @description  自动搜索脚本
// @author       怀沙2049
// @match        https://*.bing.com/*
// @exclude      https://rewards.bing.com/*
// @license      GNU GPLv3
// @icon         https://www.bing.com/favicon.ico
// @downloadURL  https://raw.githubusercontent.com/yanlz84/bing-auto-search/refs/heads/master/bing.js?t=
// @updateURL    https://raw.githubusercontent.com/yanlz84/bing-auto-search/refs/heads/master/bing.js?t=
// @run-at       document-end
// @grant        GM_registerMenuCommand
// @grant        GM_addStyle
// @grant        GM_openInTab
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// ==/UserScript==

var max_rewards = 40; //重复执行的次数
//每执行4次搜索后插入暂停时间,解决账号被监控不增加积分的问题
var pause_time = 5000; // 暂停时长建议为16分钟,也就是960000(60000毫秒=1分钟)
var search_words = []; //搜索词


//默认搜索词，热门搜索词请求失败时使用
var default_search_words = ["习近平总书记40余年的牵挂", "印度宣布击落至少5架巴基斯坦战斗机", "央视主持人上新", "子弟兵的背永远是最坚实的依靠", "医院通报禁止规培生进职工餐厅吃饭", "“外卖健身”突然火了", "董璇：下一个大事就是有了小小张", "西安汉服店主被拘5天 女游客被拘6天", "司机逆停堵路近1小时 派出所回应", "群殴澳洲留学生肇事者被全部抓获", "外卖员被曝隔窗偷拍女生洗澡", "用28万LV包测试路人诚信？系摆拍", "小伙骑车剐蹭 全程只说一句话", "企业老总提议给自己发200万月薪", "包头通报人才引进问题：存在因人设岗", "孙颖莎被罚黄牌", "纪念抗战胜利80周年大会首次演练结束", "幼儿园招生进入白热化", "总领馆：遭群殴留学生已无生命危险", "赵露思手机号被泄露给整形医院", "娃哈哈砍掉年销300万以下经销商", "出逃被人抱走的宠物龟找到了", "双腿截肢女子夜市摆摊成“团宠”", "百果园董事长谈水果贵：教消费者成熟", "普京到访阿拉斯加将“创造历史”", "张晋自曝旅行突发心脏病险丧命", "中国留学生在澳遭围殴视频曝光", "洪水1分钟冲走10多辆车清空停车场", "高速堵车司机下车查看被大货车追尾", "孙颖莎终结桥本对国乒的11连胜", "男子无人区投喂狼反遭“背刺”", "婚内强奸案将开庭 被告人姐姐发声", "温柔乡变仙人跳 男子出国陷“围猎”", "开封万岁山NPC回应被游客“锁喉”", "人人人人人人机器人人人人人人", "80多头牛失踪20多头俩月后寻见", "陈楚生断层拿下“歌王”却饱受争议", "大爷摆摊自称送20万现金 当地回应", "小伙被剐蹭后持续冷静回答", "乌使用无人机袭击俄鞑靼斯坦共和国", "女子在东京大学烟囱坠亡 友人发声", "山姆最忠实的学徒不开会员店了", "干旱38天后 驻马店农民等来了一场雨", "中共中央对外联络部原部长朱良逝世", "23国发表联合声明谴责以色列", "男子联合母亲公开辱骂妻子被拘", "骆驼受惊将母子摔下驼背 军医施救", "曝俄要求乌作出重大领土让步", "中国大胜约旦 晋级男篮亚洲杯8强", "中国男篮三战全胜晋级八强", "前车爆胎未撤离 后车开“智驾”追尾"]

// 直接使用默认搜索词
search_words = default_search_words;
exec();

// 定义菜单命令：开始
let menu1 = GM_registerMenuCommand('开始', function () {
    GM_setValue('Cnt', 0); // 将计数器重置为0
    location.href = "https://www.bing.com/?br_msg=Please-Wait"; // 跳转到Bing首页
}, 'o');

// 定义菜单命令：停止
let menu2 = GM_registerMenuCommand('停止', function () {
    GM_setValue('Cnt', max_rewards + 10); // 将计数器设置为超过最大搜索次数，以停止搜索
}, 'o');

// 自动将字符串中的字符进行替换
function AutoStrTrans(st) {
    let yStr = st; // 原字符串
    let rStr = ""; // 插入的混淆字符，可以自定义自己的混淆字符串
    let zStr = ""; // 结果字符串
    let prePo = 0;
    for (let i = 0; i < yStr.length;) {
        let step = parseInt(Math.random() * 5) + 1; // 随机生成步长
        if (i > 0) {
            zStr = zStr + yStr.substr(prePo, i - prePo) + rStr; // 将插入字符插入到相应位置
            prePo = i;
        }
        i = i + step;
    }
    if (prePo < yStr.length) {
        zStr = zStr + yStr.substr(prePo, yStr.length - prePo); // 将剩余部分添加到结果字符串中
    }
    return zStr;
}

// 生成指定长度的包含大写字母、小写字母和数字的随机字符串
function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        // 从字符集中随机选择字符，并拼接到结果字符串中
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function exec() {
    // 生成随机延迟时间
    let randomDelay = Math.floor(Math.random() * 20000) + 5000; // 生成5秒到25秒之间的随机数
    let randomString = generateRandomString(4); //生成4个长度的随机字符串
    let randomCvid = generateRandomString(32); //生成32位长度的cvid
    'use strict';

    // 检查计数器的值，若为空则设置为超过最大搜索次数
    if (GM_getValue('Cnt') == null) {
        GM_setValue('Cnt', max_rewards + 10);
    }

    // 获取当前搜索次数
    let currentSearchCount = GM_getValue('Cnt');
    // 根据计数器的值选择搜索引擎
    if (currentSearchCount <= max_rewards / 2) {
        let tt = document.getElementsByTagName("title")[0];
        tt.innerHTML = "[" + currentSearchCount + " / " + max_rewards + "] " + tt.innerHTML; // 在标题中显示当前搜索次数
        smoothScrollToBottom(); // 添加执行滚动页面到底部的操作
        GM_setValue('Cnt', currentSearchCount + 1); // 将计数器加1
        setTimeout(function () {
            let nowtxt = search_words[currentSearchCount]; // 获取当前搜索词
            nowtxt = AutoStrTrans(nowtxt); // 对搜索词进行替换
            setTimeout(function () {
                location.href = "https://www.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
            }, pause_time);
        }, randomDelay);
    } else if (currentSearchCount > max_rewards / 2 && currentSearchCount < max_rewards) {
        let tt = document.getElementsByTagName("title")[0];
        tt.innerHTML = "[" + currentSearchCount + " / " + max_rewards + "] " + tt.innerHTML; // 在标题中显示当前搜索次数
        smoothScrollToBottom(); // 添加执行滚动页面到底部的操作
        GM_setValue('Cnt', currentSearchCount + 1); // 将计数器加1

        setTimeout(function () {
            let nowtxt = search_words[currentSearchCount]; // 获取当前搜索词
            nowtxt = AutoStrTrans(nowtxt); // 对搜索词进行替换
            setTimeout(function () {
                location.href = "https://cn.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
            }, pause_time);
        }, randomDelay);
    }
    // 实现平滑滚动到页面底部的函数
    function smoothScrollToBottom() {
         document.documentElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
}
